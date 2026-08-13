import { useId } from "react";
import { TOption } from "@/types/common";
import { FieldSet, FieldLegend } from "./field";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

type RadioFieldProps<TValue extends string> = Readonly<{
  label: string;
  name: string;
  options: TOption[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}>;

export function RadioField<TValue extends string>({
  label,
  name,
  options,
  value,
  onValueChange,
}: RadioFieldProps<TValue>) {
  const radioGroupId = useId();

  return (
    <FieldSet className="gap-2">
      <FieldLegend variant="label" className="text-xs font-medium">
        {label}
      </FieldLegend>
      <RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        className="flex flex-wrap gap-x-4 gap-y-2"
        aria-label={label}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem id={`${radioGroupId}-${option.value}`} value={option.value} />
            <Label htmlFor={`${radioGroupId}-${option.value}`} className="cursor-pointer text-xs font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FieldSet>
  );
}
