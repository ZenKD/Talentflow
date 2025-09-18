// src/components/Filter.js

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const Filter = ({ selectedTags, setSelectedTags }) => {
  const predefinedTags = ["react", "c++", "c", "c#", "javascript"];

  const handleTagChange = (event, tag) => {
    if (event.target.checked) {
      // Add the tag to the list of selected tags
      setSelectedTags([...selectedTags, tag]);
    } else {
      // Remove the tag from the list
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  return (
    <div className="filter">
      Filter by Tags
      <FormGroup>
        {predefinedTags.map((tag) => (
          <FormControlLabel
            key={tag}
            control={
              <Checkbox
                // The checkbox is checked if the tag is in the selectedTags array
                checked={selectedTags.includes(tag)}
                // Use onChange on the Checkbox directly
                onChange={(event) => handleTagChange(event, tag)}
              />
            }
            label={tag}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default Filter;
