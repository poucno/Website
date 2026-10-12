export type Answer = {
  id: string
  text: string
}

export type Question = {
  id: string
  text: string
  answers: [Answer, Answer, Answer]
  correctAnswerId: string
  hint?: string
}

export type QuestionSet = {
  version: 1
  title: string
  subject: string
  grade: number
  settings: {
    shuffleQuestions: boolean
    movingBalloons: boolean
  }
  questions: Question[]
}

export type Collection = QuestionSet & { id: string }
