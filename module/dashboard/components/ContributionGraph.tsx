import { useQuery } from "@tanstack/react-query";
import React from "react";
import { getContributionStats } from "../actions";
import { useTheme } from "next-themes";
import { ActivityCalendar } from "react-activity-calendar";

const ContributionGraph = () => {
  const { theme } = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStats(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading Contribution Data...
        </div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          No Contribution data available...
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {data.totalContributions}
        </span>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max justify-center px-4">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={11}
            blockMargin={4}
            fontSize={14}
            showMonthLabels
            showWeekdayLabels
            theme={{
              light: [
                "#ebedf0", // Level 0: No contributions (light gray)
                "#9be9a8", // Level 1: Low
                "#40c463", // Level 2: Medium-low
                "#30a14e", // Level 3: Medium-high
                "#216e39", // Level 4: High (dark green)
              ],
              dark: [
                "#151b23", // Level 0: No contributions (dark gray/navy, GitHub style)
                "#0e4429", // Level 1: Low
                "#006d32", // Level 2: Medium-low
                "#26a641", // Level 3: Medium-high
                "#39d353", // Level 4: High (bright green)
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
