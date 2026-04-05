import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFieldProps {
  label: string;
  required?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  type: "text" | "email" | "date" | "number";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox";
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

type FormFieldProps = TextFieldProps | TextareaFieldProps | CheckboxFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, required } = props;
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  if (props.type === "checkbox") {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldId}
          checked={props.checked}
          onCheckedChange={(c) => props.onChange(!!c)}
        />
        <Label htmlFor={fieldId} className="text-sm cursor-pointer">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
    );
  }

  if (props.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (props.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id={fieldId}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
      />
    </div>
  );
}
