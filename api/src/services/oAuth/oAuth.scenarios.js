import { generateRandomMembers } from '../../../../scripts/seed/helpers'

const generatedMembers = generateRandomMembers(4, 0)

const member = {}
const names = ['alice', 'bob', 'carol', 'dan', 'eve']
generatedMembers.map((item, index) => {
  member[names[index]] = { data: item }
})

export const standard = defineScenario({
  member,
})
