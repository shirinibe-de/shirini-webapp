import { TeamPage } from './TeamPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <TeamPage teamId={id} />
}
