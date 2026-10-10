import { site } from "@/content/site";
import type { ContributionCalendar } from "@/lib/types";
import { Panel } from "./Panel";

const CELL = 10;
const STEP = 13; // cell plus gap
const LEFT = 30; // room for day labels
const TOP = 16; // room for month labels

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${months[m - 1]} ${d}, ${y}`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function summary(cal: ContributionCalendar) {
  const days = cal.weeks.flat();
  const active = days.filter((d) => d.count > 0).length;
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  let text = `${plural(cal.total, "contribution")} in the last year, on ${plural(active, "day")}.`;
  if (best && best.count > 0) text += ` Busiest day: ${formatDate(best.date)} with ${best.count}.`;
  return text;
}

/** Month labels: placed on the first week whose first day starts a new month */
function monthLabels(cal: ContributionCalendar) {
  const labels: { x: number; text: string }[] = [];
  let lastMonth = -1;
  let lastX = -Infinity;
  cal.weeks.forEach((week, i) => {
    const first = week[0];
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    const x = LEFT + i * STEP;
    if (month !== lastMonth) {
      // Skip a label that would overlap the one before it
      if (x - lastX >= STEP * 3) {
        labels.push({ x, text: months[month] });
        lastX = x;
      }
      lastMonth = month;
    }
  });
  return labels;
}

export function Contributions({ calendar }: { calendar: ContributionCalendar | null }) {
  const profile = `https://github.com/${site.handle}`;

  if (!calendar || calendar.weeks.length === 0) {
    return (
      <Panel id="contributions" title="Contributions">
        <p className="text-sm text-mu">
          The contribution graph is offline right now.{" "}
          <a href={profile} className="text-ac2 hover:underline">
            See it on GitHub
          </a>
          .
        </p>
      </Panel>
    );
  }

  const width = LEFT + calendar.weeks.length * STEP;
  const height = TOP + 7 * STEP;
  const label = `Contribution graph. ${summary(calendar)}`;

  return (
    <Panel id="contributions" title="Contributions">
      <p className="mb-3 text-sm">
        <span className="font-medium text-ac">{calendar.total}</span> contributions in the last year
      </p>
      {/* dir="rtl" starts the scroll at the newest weeks on narrow screens */}
      <div dir="rtl" tabIndex={0} role="region" aria-label="Contribution graph, scrolls sideways" className="overflow-x-auto rounded-md">
        <svg style={{ direction: "ltr" }} role="img" aria-label={label} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block text-[10px]">
          {monthLabels(calendar).map((m) => (
            <text key={m.x} x={m.x} y={10} className="fill-mu">
              {m.text}
            </text>
          ))}
          {[
            [1, "Mon"],
            [3, "Wed"],
            [5, "Fri"],
          ].map(([row, text]) => (
            <text key={text} x={0} y={TOP + (row as number) * STEP + 9} className="fill-mu">
              {text}
            </text>
          ))}
          {calendar.weeks.map((week, i) =>
            week.map((day) => {
              const row = new Date(day.date + "T00:00:00Z").getUTCDay();
              return (
                <rect key={day.date} x={LEFT + i * STEP} y={TOP + row * STEP} width={CELL} height={CELL} rx={2} className={`heat-${day.level}`}>
                  <title>{`${plural(day.count, "contribution")} on ${formatDate(day.date)}`}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-mu">
        <a href={profile} className="text-ac2 hover:underline">
          View on GitHub
        </a>
        <span className="flex items-center gap-1" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <svg key={l} width={CELL} height={CELL}>
              <rect width={CELL} height={CELL} rx={2} className={`heat-${l}`} />
            </svg>
          ))}
          More
        </span>
      </div>
    </Panel>
  );
}
