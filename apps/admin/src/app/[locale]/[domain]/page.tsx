interface PageProps {
  params: Promise<{
    domain: string;
  }>;
}

export default async function DomainPage({ params }: PageProps) {
  const { domain } = await params;
  return <div>DomainPage {domain}</div>;
}
