import type { Collection, QuestionSet } from '../types/collection'
import { hasValidationErrors, trimCollection, validateQuestionSet } from './collectionValidation'

// Export needs at least one question and no validation errors.
export function canExportCollection(collection: Collection): boolean {
  return !hasValidationErrors(validateQuestionSet(collection))
}

// The local collection ID is not part of the shared JSON format.
export function toExportData(collection: Collection): QuestionSet {
  const trimmed = trimCollection(collection)
  return {
    version: 1,
    title: trimmed.title,
    subject: trimmed.subject,
    grade: trimmed.grade,
    settings: {
      shuffleQuestions: trimmed.settings.shuffleQuestions,
      movingBalloons: trimmed.settings.movingBalloons,
    },
    questions: trimmed.questions.map(question => ({
      id: question.id,
      text: question.text,
      answers: question.answers.map(answer => ({ id: answer.id, text: answer.text })) as typeof question.answers,
      correctAnswerId: question.correctAnswerId,
      ...(question.hint ? { hint: question.hint } : {}),
    })),
  }
}

export function exportFileName(title: string): string {
  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${slug || 'zbirka'}.json`
}

export function downloadCollectionJson(collection: Collection): void {
  const blob = new Blob([JSON.stringify(toExportData(collection), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exportFileName(collection.title)
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
