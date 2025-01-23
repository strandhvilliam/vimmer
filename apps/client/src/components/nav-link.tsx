import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSerializer, parseAsString, useQueryState } from "nuqs";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const serializer = createSerializer({
  participantReference: parseAsString,
  competitionClass: parseAsString,
  deviceGroup: parseAsString,
});

// Helper component that preserves search params
export default function NavLink({ href, children }: NavLinkProps) {
  const [participantReference] = useQueryState(
    "participant-reference",
    parseAsString,
  );
  const [competitionClass] = useQueryState("competition-class", parseAsString);
  const [deviceGroup] = useQueryState("device-group", parseAsString);
  const hrefWithParams = `${href}?${serializer({ participantReference, competitionClass, deviceGroup })}`;

  return <Link href={hrefWithParams}>{children}</Link>;
}
