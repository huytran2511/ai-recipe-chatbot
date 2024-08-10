'use client'

import { Box, Button, Stack, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm RecipeGenie, your personal culinary assistant. Just tell me what ingredients you have, 
      and I'll work my magic to create delicious recipes tailored to your preferences. 
      Whether you have dietary needs or allergies, I've got you covered! Let's get cooking—what ingredients do you have today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const translations = {
    en: {
      welcomeTitle: "Welcome to RecipeGenie!",
      assistantGreeting: `Hello! I'm RecipeGenie, your personal culinary assistant. Just tell me what ingredients you have, 
      and I'll work my magic to create delicious recipes tailored to your preferences. 
      Whether you have dietary needs or allergies, I've got you covered! Let's get cooking—what ingredients do you have today?`,
      messagePlaceholder: "Message",
      sendButton: "Send",
      languageLabel: "Language",
      languageOptions: {
        en: "English",
        es: "Spanish",
        fr: "French",
        vi: "Vietnamese",
      }
    },
    es: {
      welcomeTitle: "¡Bienvenido a RecipeGenie!",
      assistantGreeting: `¡Hola! Soy RecipeGenie, tu asistente culinario personal. Solo dime qué ingredientes tienes, 
      y haré mi magia para crear deliciosas recetas adaptadas a tus preferencias. 
      ¡Ya sea que tengas necesidades dietéticas o alergias, te tengo cubierto! Comencemos a cocinar—¿qué ingredientes tienes hoy?`,
      messagePlaceholder: "Mensaje",
      sendButton: "Enviar",
      languageLabel: "Idioma",
      languageOptions: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
        vi: "Vietnamita",
      }
    },
    fr: {
      welcomeTitle: "Bienvenue sur RecipeGenie!",
      assistantGreeting: `Bonjour! Je suis RecipeGenie, votre assistant culinaire personnel. Dites-moi simplement quels ingrédients vous avez, 
      et je ferai de la magie pour créer de délicieuses recettes adaptées à vos préférences. 
      Que vous ayez des besoins alimentaires ou des allergies, je suis là pour vous! Commençons à cuisiner—quels ingrédients avez-vous aujourd'hui?`,
      messagePlaceholder: "Message",
      sendButton: "Envoyer",
      languageLabel: "Langue",
      languageOptions: {
        en: "Anglais",
        es: "Espagnol",
        fr: "Français",
        vi: "Vietnamien",
      }
    },
    vi: {
      welcomeTitle: "Chào mừng đến với RecipeGenie!",
      assistantGreeting: `Xin chào! Tôi là RecipeGenie, trợ lý ẩm thực cá nhân của bạn. Hãy cho tôi biết bạn có những nguyên liệu gì, 
      và tôi sẽ tạo ra những công thức nấu ăn ngon miệng phù hợp với sở thích của bạn. 
      Dù bạn có nhu cầu ăn kiêng hay dị ứng, tôi đã sẵn sàng! Hãy bắt đầu nấu ăn—bạn có những nguyên liệu gì hôm nay?`,
      messagePlaceholder: "Tin nhắn",
      sendButton: "Gửi",
      languageLabel: "Ngôn ngữ",
      languageOptions: {
        en: "Tiếng Anh",
        es: "Tiếng Tây Ban Nha",
        fr: "Tiếng Pháp",
        vi: "Tiếng Việt",
      }
    },
  }

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    setMessages([
      {
        role: 'assistant',
        content: translations[newLanguage].assistantGreeting,
      },
    ])
  }

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
    setIsLoading(true)
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }, { role: 'system', content: `Language: ${language}` }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: 'bold' }}
      >
        {translations[language].welcomeTitle}
      </Typography>
      <Box display="flex" justifyContent="space-between" width="800px">
        <Stack
          direction={'column'}
          width="800px"
          height="700px"
          border="1px solid #979797"
          borderRadius={2}
          p={3}
          spacing={3}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? '#dedede'
                      : '#4285F4'
                  }
                  color={
                    message.role === 'assistant'
                      ? 'black'
                      : 'white'
                  }
                  borderRadius={4}
                  p={2}
                  pl={3}
                  pr={3}
                  lineHeight={1.8}
                  maxWidth="80%"
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label={translations[language].messagePlaceholder}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              sx={{
                borderRadius: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4}}}
            />
            <Button
              variant="contained" 
              onClick={sendMessage}
              disabled={isLoading}
              sx={{borderRadius: 4, backgroundColor: '#4285F4'}}
            >
              {isLoading ? 'Sending...' : translations[language].sendButton}
            </Button>
          </Stack>
        </Stack>
        <Stack direction="column" alignItems="center" ml={2}>
          <InputLabel sx={{ textAlign: 'left', color: 'black', pb: 0.5, width: '100%'}}>
            {translations[language].languageLabel}
          </InputLabel>
          <FormControl>
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{ minWidth: 120 }}
            >
              {Object.keys(translations[language].languageOptions).map((key) => (
                <MenuItem key={key} value={key}>
                  {translations[language].languageOptions[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </Box>
  )
}
