import React, { useState } from "react";
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_KEY || '';
  const SECRET_KEY = process.env.REACT_APP_AWS_SECRET_KEY || '';

    const bedrockClient = new BedrockRuntimeClient({
      region: "us-east-1",
      credentials: {
        secretAccessKey: SECRET_KEY,
        accessKeyId: ACCESS_KEY,
      }
    })
  
  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    console.log(userMessage.text);

    try {
      const response = await bedrockClient.send(
        new InvokeModelCommand(
          {
            modelId: "amazon.titan-text-express-v1",
            contentType: "application/json",
            body: JSON.stringify({
              inputText: userMessage.text,
              textGenerationConfig: {
                maxTokenCount: 8192,
                stopSequences: [],
                temperature: 0,
                topP: 1,
                
              }
            })
           }               
        )
      );

      const decodedResponseBody = new TextDecoder().decode(response.body);
      const responseBody = JSON.parse(decodedResponseBody);

      console.log(responseBody);

      const botMessage = { sender: 'bot', text: responseBody.results[0].outputText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching bot response:', error);
      const botMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;