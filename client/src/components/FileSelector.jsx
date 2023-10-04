import  { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const FileSelector = ({ onChange }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <Tabs value={value} onChange={handleChange} centered>
      <Tab label="Image" />
      <Tab label="PDF" />
    </Tabs>
  );
};

export default FileSelector;
