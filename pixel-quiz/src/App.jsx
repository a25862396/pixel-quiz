import { useState, useEffect } from 'react'
import Game from './Game'

function App() {
  const [userId, setUserId] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [gameState, setGameState] = useState('login') // login, playing, result
  const [score, setScore] = useState(0)
  const [reviewData, setReviewData] = useState([])

  useEffect(() => {
    if (gameState === 'login') {
      const randomSeed = Math.random().toString(36).substring(7)
      setAvatarUrl(`https://api.dicebear.com/9.x/pixel-art/svg?seed=${randomSeed}`)
      setReviewData([]) // 回首頁時清空
    }
  }, [gameState])

  const handleStartGame = () => {
    if (!userId.trim()) {
      alert('請輸入您的 ID！')
      return
    }
    setGameState('playing')
  }

  const handleGameOver = async (answers) => {
    setGameState('calculating')
    const apiUrl = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL
    const passThreshold = import.meta.env.VITE_PASS_THRESHOLD || 3
    const questionCount = import.meta.env.VITE_QUESTION_COUNT || 5

    if (!apiUrl) {
      setScore(100)
      setGameState('result')
      return
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ userId, answers, passThreshold, questionCount })
      })
      const result = await response.json()
      if (result.score !== undefined) {
        setScore(result.score)
        if (result.reviewData) {
          const combined = answers.map(ans => {
            const back = result.reviewData.find(r => r.qId === ans.qId) || {}
            return {
              ...ans,
              correctAnswer: back.correctAnswer,
              isCorrect: back.isCorrect
            }
          })
          setReviewData(combined)
        }
      } else {
        setScore(0)
      }
    } catch (error) {
      console.error('儲存成績失敗', error)
      setScore(0)
    } finally {
      setGameState('result')
    }
  }

  if (gameState === 'playing') {
    return <Game userId={userId} onGameOver={handleGameOver} />
  }

  if (gameState === 'calculating') {
    return (
      <div className="pixel-box" style={{ maxWidth: '1200px', width: '95%' }}>
        <h1 style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>成績計算中...</h1>
      </div>
    )
  }

  if (gameState === 'result') {
    return (
      <div className="pixel-box" style={{ maxWidth: '1200px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>遊戲結束</h1>
        <p style={{ fontSize: '22pt', whiteSpace: 'nowrap', color: 'var(--primary)', marginBottom: '2rem' }}>您的成績是：{score} 分</p>
        
        {reviewData.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '22pt', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>答題回顧：</h2>
            {reviewData.map((item, index) => (
              <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', background: item.isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(242, 139, 130, 0.1)', border: '2px solid', borderColor: item.isCorrect ? 'var(--primary)' : '#f28b82' }}>
                <p style={{ fontSize: '18pt', marginBottom: '0.5rem', color: '#cdd6f4' }}>Q{index + 1}: {item.questionText}</p>
                <p style={{ fontSize: '16pt', color: item.isCorrect ? 'var(--primary)' : '#f28b82' }}>
                  您的回答：{item.answer} {item.isCorrect ? '✅' : '❌'}
                </p>
                {!item.isCorrect && (
                  <p style={{ fontSize: '16pt', color: 'var(--primary)', marginTop: '0.5rem' }}>
                    正確解答：{item.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <button className="pixel-button" onClick={() => setGameState('login')} style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>
          回首頁
        </button>
      </div>
    )
  }

  return (
    <div className="pixel-box" style={{ maxWidth: '1200px', width: '95%' }}>
      <div className="avatar-container" style={{ width: '100px', height: '100px' }}>
        {avatarUrl && <img src={avatarUrl} alt="關主圖片" />}
      </div>
      
      <h1 style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>像素闖關遊戲</h1>
      <p style={{ fontSize: '22pt', whiteSpace: 'nowrap' }}>請輸入您的玩家 ID 來開始挑戰</p>
      
      <input 
        type="text" 
        className="pixel-input" 
        placeholder="PLAYER_ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ fontSize: '22pt', textAlign: 'center' }}
      />
      
      <button className="pixel-button" style={{ fontSize: '22pt', whiteSpace: 'nowrap' }} onClick={handleStartGame}>
        START GAME
      </button>
    </div>
  )
}

export default App
