// Convex registration bindings. Regenerate using `npx convex codegen` after configuring deployment.
import { queryGeneric, mutationGeneric, actionGeneric, internalQueryGeneric, internalMutationGeneric, internalActionGeneric, httpActionGeneric } from 'convex/server'
import type { QueryBuilder, MutationBuilder, ActionBuilder } from 'convex/server'
import type { DataModel } from './dataModel'
export const query: QueryBuilder<DataModel, 'public'> = queryGeneric
export const mutation: MutationBuilder<DataModel, 'public'> = mutationGeneric
export const action: ActionBuilder<DataModel, 'public'> = actionGeneric
export const internalQuery: QueryBuilder<DataModel, 'internal'> = internalQueryGeneric
export const internalMutation: MutationBuilder<DataModel, 'internal'> = internalMutationGeneric
export const internalAction: ActionBuilder<DataModel, 'internal'> = internalActionGeneric
export const httpAction = httpActionGeneric
