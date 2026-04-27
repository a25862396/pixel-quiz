import { useState, useEffect } from 'react'

// 假資料：若還沒設定 Google App Script 網址時會使用
const MOCK_QUESTIONS = [
  { id: 1, question: "世界上最高的山是什麼？", options: ["A. 聖母峰", "B. 富士山", "C. 玉山", "D. 阿里山"] },
  { id: 2, question: "React 是由哪家公司開發的？", options: ["A. Google", "B. Apple", "C. Meta", "D. Amazon"] },
  { id: 3, question: "下列何者不是前端框架？", options: ["A. Vue", "B. React", "C. Django", "D. Angular"] }
]

export default function Game({ userId, onGameOver }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    // 每關隨機換關主
    const randomSeed = Math.random().toString(36).substring(7)
    setAvatarUrl(`https://api.dicebear.com/9.x/pixel-art/svg?seed=${randomSeed}`)
  }, [currentIndex])

  useEffect(() => {
    const fetchQuestions = async () => {
      const apiUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL
      const count = import.meta.env.VITE_QUESTION_COUNT || 5
      if (!apiUrl) {
        console.log("未設定 API，使用假資料")
        setQuestions(MOCK_QUESTIONS)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${apiUrl}?action=getQuestions&count=${count}`)
        const data = await response.json()
        setQuestions(data)
      } catch (error) {
        console.error("讀取題目失敗", error)
        setQuestions(MOCK_QUESTIONS)
      }
      setLoading(false)
    }

    fetchQuestions()
  }, [])

  const handleAnswer = (optionIndex) => {
    const optionLetter = ['A', 'B', 'C', 'D'][optionIndex]
    const newAnswers = [...answers, { 
      qId: questions[currentIndex].id, 
      questionText: questions[currentIndex].question,
      options: questions[currentIndex].options,
      answer: optionLetter 
    }]
    setAnswers(newAnswers)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onGameOver(newAnswers)
    }
  }

  if (loading) {
    return <div className="pixel-box" style={{ maxWidth: '1200px', width: '95%' }}><h2 style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>讀取中...</h2></div>
  }

  const currentQ = questions[currentIndex]

  return (
    <div className="pixel-box" style={{ maxWidth: '1200px', width: '95%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '22pt', whiteSpace: 'nowrap' }}>
        <span>Player: {userId}</span>
        <span style={{ marginLeft: '1rem' }}>Stage: {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="avatar-container" style={{ width: '100px', height: '100px' }}>
        <img src={avatarUrl} alt="關主圖片" />
      </div>

      <h2 style={{ fontSize: '22pt', marginBottom: '2rem', lineHeight: '2', whiteSpace: 'nowrap' }}>
        {currentQ.question}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentQ.options.map((opt, idx) => (
          <button 
            key={idx} 
            className="pixel-button" 
            style={{ textAlign: 'left', textTransform: 'none', fontSize: '22pt', whiteSpace: 'nowrap' }}
            onClick={() => handleAnswer(idx)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
