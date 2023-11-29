import { useTimerStore } from "@/store/timerStore";
import CardStatistic from "./CardStatistic";
import getTotalCubesSolved from "@/lib/getTotalCubesSolved";
import getTotalEvents from "@/lib/getTotalEvents";
import getTotalTimeCubing from "@/lib/getTotalTimeCubing";
import getMostPlayedEvent from "@/lib/getMostPlayedEvent";
import getTotalRatingPoints from "@/lib/getTotalRatingPoints";
import getSessionInProgress from "@/lib/getSessionInProgress";
import LastActivity from "./LastActivity";
import getTitleByPoints from "@/lib/getTitleByPoints";
import Hashtag from "@/icons/Hashtag";
import PresentationChart from "@/icons/PresentationChart";
import Clock from "@/icons/Clock";
import ChartPie from "@/icons/ChartPie";
import CalendarDays from "@/icons/CalentarDays";
import Fire from "@/icons/Fire";
import Flag from "@/icons/Flag";
import Trophy from "@/icons/Trophy";
import translation from "@/translations/global.json";
import { useSettingsModalStore } from "@/store/SettingsModalStore";
import RadarCharter from "../charts/RadarCharter";
import getTotalCategoryPlay from "@/lib/getTotalCategoryPlay";
import getSuccessRate from "@/lib/getSuccessRate";
import { PersonalContainer } from "./PersonalContainer";
import { PersonalCardsContainer } from "./PersonalCardsContainer";
import { PersonalChartsContainer } from "./PersonalChartsContainer";

export default function PersonalStatistics() {
  const { cubes } = useTimerStore();
  const { lang } = useSettingsModalStore();
  const totalCubesSolved = getTotalCubesSolved(cubes);
  const totalEvents = getTotalEvents(cubes);
  const totalTimeCubing = getTotalTimeCubing(cubes);
  const mostPlayedEvent = getMostPlayedEvent(cubes);
  const { totalNumeric, totalFormatted } = getTotalRatingPoints(cubes);
  const sessionsInProgress = getSessionInProgress(cubes);
  const cuberTitle = getTitleByPoints(totalNumeric);
  const rate = getSuccessRate(cubes);
  const data01 = getTotalCategoryPlay(cubes);

  return (
    <>
      <PersonalContainer>
        <PersonalCardsContainer>
          <CardStatistic
            label={translation.metrics.cards["classification"][lang]}
            total={cuberTitle}
            icon={<Trophy />}
          />

          <CardStatistic
            label={translation.metrics.cards["rating-points"][lang]}
            total={totalFormatted}
            icon={<PresentationChart />}
          />

          <CardStatistic
            label={translation.metrics.cards["time-spent-cubing"][lang]}
            total={totalTimeCubing}
            icon={<Clock />}
          />

          <CardStatistic
            label={translation.metrics.cards["total-solves"][lang]}
            total={totalCubesSolved}
            icon={<Hashtag />}
          />

          <CardStatistic
            label={translation.metrics.cards["most-played"][lang]}
            total={mostPlayedEvent}
            icon={<ChartPie />}
          />

          <CardStatistic
            label={translation.metrics.cards["sessions-in-progress"][lang]}
            total={sessionsInProgress}
            icon={<CalendarDays />}
          />

          <CardStatistic
            label={translation.metrics.cards["success-rate"][lang]}
            total={rate + "%"}
            icon={<Fire />}
          />

          <CardStatistic
            label={translation.metrics.cards["total-events"][lang]}
            total={totalEvents}
            icon={<Flag />}
          />
        </PersonalCardsContainer>
        <PersonalChartsContainer>
          <div className="w-full h-96">
            <RadarCharter data={data01} />
          </div>
          <div className="mb-3 text-2xl font-medium text-center">
            {translation.metrics["cube-insights"][lang]}
          </div>
        </PersonalChartsContainer>
        <LastActivity />
      </PersonalContainer>
    </>
  );
}
