import { describe, expect, it } from 'vitest'
import type { Collection } from '../types/collection'
import { canExportCollection, exportFileName, toExportData } from './collectionExport'

const collection: Collection = {
  id: 'local-id',
  version: 1,
  title: '  Poštevanka števila 6 ',
  subject: 'matematika',
  grade: 3,
  settings: { shuffleQuestions: true, movingBalloons: true },
  questions: [{
    id: 'q1',
    text: 'Koliko je 6 × 4?',
    answers: [{ id: 'a', text: '18' }, { id: 'b', text: '24' }, { id: 'c', text: '30' }],
    correctAnswerId: 'b',
    hint: '  ',
  }],
}

describe('collection export', () => {
  it('leaves out the local ID and trims text', () => {
    const data = toExportData(collection)
    expect(data).not.toHaveProperty('id')
    expect(data.title).toBe('Poštevanka števila 6')
    expect(data.questions[0]?.hint).toBeUndefined()
  })

  it('serializes only contract fields without changing the source', () => {
    const source = structuredClone(collection)
    Object.assign(source.settings, { internal: 'private' })
    Object.assign(source.questions[0]!, { internal: 'private' })
    Object.assign(source.questions[0]!.answers[0], { internal: 'private' })
    const before = structuredClone(source)
    const json = JSON.stringify(toExportData(source))
    expect(json).not.toContain('internal')
    expect(json).toContain('Poštevanka števila 6')
    expect(JSON.parse(json)).toEqual({
      version: 1, title: 'Poštevanka števila 6', subject: 'matematika', grade: 3,
      settings: { shuffleQuestions: true, movingBalloons: true },
      questions: [{
        id: 'q1', text: 'Koliko je 6 × 4?',
        answers: [{ id: 'a', text: '18' }, { id: 'b', text: '24' }, { id: 'c', text: '30' }],
        correctAnswerId: 'b',
      }],
    })
    expect(source).toEqual(before)
  })

  it('needs at least one valid question', () => {
    expect(canExportCollection(collection)).toBe(true)
    expect(canExportCollection({ ...collection, questions: [] })).toBe(false)
  })

  it('builds a safe file name', () => {
    expect(exportFileName('Poštevanka števila 6')).toBe('postevanka-stevila-6.json')
    expect(exportFileName('???')).toBe('zbirka.json')
  })
})
