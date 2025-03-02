interface PageProps {
  params: {
    domain: string;
  };
}

export default function DomainPage({ params }: PageProps) {
  const { domain } = params;
  return <div>DomainPage {domain}</div>;
}
