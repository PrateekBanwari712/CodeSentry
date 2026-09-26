import {embed} from "ai";
import {google} from "@ai-sdk/google";
import { pineconeIndex } from "@/lib/pinecone";

export const generateEmbedding = async (text: string) => {
    const {embedding} = await embed({
        model: google.embedding('gemini-embedding-001'),
        value: text,
        providerOptions: {
            google: {
                outputDimensionality: 768,
            }
        }
    });

    return embedding;
}

export const indexCodebase = async (repoId: string, files: {path: string; content: string}[]) => {

    const vectors = [];

    for(const file of files) {
        const content = `file: ${file.path}\n\n${file.content}`;

        const truncatedContent = content.slice(0, 8000);

        try {
            const embedding = await generateEmbedding(truncatedContent);

            vectors.push({
                id:`${repoId}-${file.path.replace(/\//g, '_')}`,
                values: embedding,
                metadata:{
                    repoId,
                    path:file.path,
                    content:truncatedContent
                }
            })
            
        } catch (error) {
            console.error(`Failed to embed ${file.path}:`, error);
        }
    }

    if(vectors.length > 0){
        const batchSize = 100;
        for(let i = 0; i < vectors.length; i +=  batchSize){
            const batch = vectors.slice(i, i+batchSize);

            await pineconeIndex.upsert({records: batch})
        }
    }
    console.log("Indexing complete")
}

export async function retrieverContext(query: string, repoId: string, topK:number= 5){
    const embedding = await generateEmbedding(query);

    const results = await pineconeIndex.query({
        vector: embedding,
        filter:{repoId},
        topK,
        includeMetadata: true
    });

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}