import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
export default function SwitchLabels({ label = "Required", checked, onChange }) {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={onChange}
          />
        }
        label={label}
        sx={{
          color: '#e5e7eb',
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }}
      />
    </FormGroup>
  );
}