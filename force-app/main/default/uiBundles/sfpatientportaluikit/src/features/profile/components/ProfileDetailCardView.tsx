import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui";
import { TOption } from "@/types/common";

type ProfileDetailCardViewProps = Readonly<{
  options: TOption[];
}>;

export function ProfileDetailCardView({ options }: ProfileDetailCardViewProps) {
  return (
    <Table>
      <TableBody>
        {options.map(({ label, value }) => (
          <TableRow key={label}>
            <TableHead className="text-muted-foreground h-14 w-56 px-4 text-xs font-normal">{label}</TableHead>
            <TableCell className="text-foreground h-14 px-4 text-sm">{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
