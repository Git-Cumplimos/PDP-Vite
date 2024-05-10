import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import "cally";
import "./Calendar.module.css";

function useListener(ref, event, listener) {
  useEffect(() => {
    const current = ref.current;

    if (current && listener) {
      current.addEventListener(event, listener);
      return () => current.removeEventListener(event, listener);
    }
  }, [ref, event, listener]);
}

function useProperty(ref, prop, value) {
  useEffect(() => {
    if (ref.current) {
      ref.current[prop] = value;
    }
  }, [ref, prop, value]);
}

export const CalendarMonth = forwardRef(function CalendarMonth(
  props,
  forwardedRef
) {
  return <calendar-month offset={props.offset} ref={forwardedRef} />;
});

export const CalendarRange = forwardRef(function CalendarRange(
  { onChange, showOutsideDays, firstDayOfWeek, isDateDisallowed, ...props },
  forwardedRef
) {
  const ref = useRef();
  useImperativeHandle(forwardedRef, () => ref.current, []);
  useListener(ref, "change", onChange);
  useProperty(ref, "isDateDisallowed", isDateDisallowed);

  return (
    <>
      <div className="p-5 mx-auto bg-secondary-light rounded-xl">
        <calendar-range
          locale="es-CO"
          ref={ref}
          show-outside-days={showOutsideDays || undefined}
          first-day-of-week={firstDayOfWeek}
          {...props}
        >
          <svg
            aria-label="Previous"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
          <svg
            aria-label="Next"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
          </svg>
          <div>{props.children}</div>
        </calendar-range>
      </div>
    </>
  );
});

export const CalendarDate = forwardRef(function CalendarDate(
  { onChange, showOutsideDays, firstDayOfWeek, isDateDisallowed, ...props },
  forwardedRef
) {
  const ref = useRef();
  useImperativeHandle(forwardedRef, () => ref.current, []);
  useListener(ref, "change", onChange);
  useProperty(ref, "isDateDisallowed", isDateDisallowed);

  return (
    <>
      <div className="p-5 mx-auto bg-secondary-light rounded-xl">
        <calendar-date
          locale="es-CO"
          ref={ref}
          show-outside-days={showOutsideDays || undefined}
          first-day-of-week={firstDayOfWeek}
          {...props}
        >
          <svg
            aria-label="Previous"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
          <svg
            aria-label="Next"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
          </svg>
          {props.children}
        </calendar-date>
      </div>
    </>
  );
});
