import { Clock3 } from "lucide-react";
import type { TimelineEvent } from "../domain/types";

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  const recent = events.slice(-3).reverse();
  return (
    <section className="timeline" aria-label="Decision activity">
      <div className="timeline-title"><Clock3 size={13} /><span>Decision activity</span></div>
      {recent.length === 0 ? (
        <p className="timeline-empty">Major decisions and accepted findings will appear here.</p>
      ) : (
        <div className="timeline-events">
          {recent.map((event) => (
            <article key={event.id} className={`timeline-event tone-${event.tone}`}>
              <i />
              <div><strong>{event.label}</strong><span>{event.detail}</span></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
