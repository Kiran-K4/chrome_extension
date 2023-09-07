import { Flex, Text } from "@radix-ui/themes";

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
    <Flex direction="row" gap="3" align="center" className="TimePicker">
      <input
        type="time"
        name="time_picker_start"
        id="time_ps"
        step="600"
        onChange={handleStartTimeChange}
        value={workTimeStart || ""}
      />
      <Text>to</Text>
      <input
        type="time"
        name="time_picker_end"
        id="time_pe"
        step="600"
        onChange={handleEndTimeChange}
        value={workTimeEnd || ""}
      />
    </Flex>
  );
}

export default TimePicker;
