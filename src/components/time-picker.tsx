import { useStorage } from "@plasmohq/storage/hook";

// import "./time-picker-style.css";

// WorkTimePicker
function TimePicker() {
  const [workTimeStart, setWorkTimeStart] = useStorage("work_time_start");
  const [workTimeEnd, setWorkTimeEnd] = useStorage("work_time_end");

  const handleStartTimeChange = (event) => {
    setWorkTimeStart(event.target.value);
  };
  const handleEndTimeChange = (event) => {
    setWorkTimeEnd(event.target.value);
  };

  return (
    <div className="TimePicker">
      <input
        type="time"
        name="time_picker_start"
        id="time_ps"
        step="600"
        onChange={handleStartTimeChange}
        value={workTimeStart || ""}
      />
      to
      <input
        type="time"
        name="time_picker_end"
        id="time_pe"
        step="600"
        onChange={handleEndTimeChange}
        value={workTimeEnd || ""}
      />
    </div>
  );
}

export default TimePicker;
