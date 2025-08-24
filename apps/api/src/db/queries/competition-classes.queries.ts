import type { Database } from "@vimmer/api/db"
import { competitionClasses, marathons } from "../schema"
import { eq } from "drizzle-orm"
import type { NewCompetitionClass } from "../types"

export async function getCompetitionClassByIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.competitionClasses.findFirst({
    where: eq(competitionClasses.id, id),
  })
  return result ?? null
}

export async function getCompetitionClassesByDomainQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db
    .select()
    .from(competitionClasses)
    .innerJoin(marathons, eq(competitionClasses.marathonId, marathons.id))
    .where(eq(marathons.domain, domain))

  return result.map((row) => row.competition_classes)
}

export async function createCompetitionClass(
  db: Database,
  { data }: { data: NewCompetitionClass }
) {
  const result = await db
    .insert(competitionClasses)
    .values(data)
    .returning({ id: competitionClasses.id })
  return { id: result[0]?.id ?? null }
}

export async function updateCompetitionClass(
  db: Database,
  {
    id,
    data,
  }: {
    id: number
    data: Partial<NewCompetitionClass>
  }
) {
  const result = await db
    .update(competitionClasses)
    .set(data)
    .where(eq(competitionClasses.id, id))
    .returning({ id: competitionClasses.id })
  return result[0]?.id ?? null
}

export async function deleteCompetitionClass(
  db: Database,
  { id }: { id: number }
) {
  const result = await db
    .delete(competitionClasses)
    .where(eq(competitionClasses.id, id))
    .returning({ id: competitionClasses.id })
  return result[0]?.id ?? null
}
