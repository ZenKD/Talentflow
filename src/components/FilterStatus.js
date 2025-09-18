// src/components/FilterStatus.js

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const FilterStatus = ({ selectedStatuses, setSelectedStatuses }) => {
  const predefinedStatuses = ["Active", "Archived"];

  const handleStatusChange = (event, status) => {
    if (event.target.checked) {
      // Add the status to the list of selected statuses
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      // Remove the status from the list
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    }
  };

  return (
    <div className="filterstatus">
      Filter by Status
      <FormGroup>
        {predefinedStatuses.map((status) => (
          <FormControlLabel
            key={status}
            control={
              <Checkbox
                // The checkbox is checked if the status is in the selectedStatuses array
                checked={selectedStatuses.includes(status)}
                // Use onChange on the Checkbox directly
                onChange={(event) => handleStatusChange(event, status)}
              />
            }
            label={status}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default FilterStatus;
