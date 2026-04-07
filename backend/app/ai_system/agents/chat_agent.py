"""
Chat Agent for AI Legal Courtroom Simulator
Handles general user queries using Gemini
"""

from typing import Dict, Optional
from app.ai_system.agents.base_agent import BaseAgent
from app.ai_system.prompts.chat_prompts import (
    CHAT_SYSTEM_PROMPT,
    CHAT_RESPONSE_TEMPLATE
)

class ChatAgent(BaseAgent):
    """
    AI Chat Assistant that answers general legal questions
    """
    
    def __init__(self, api_key: str = None, model_name: str = "gemini-1.5-flash", provider: str = "gemini"):
        """
        Initialize Chat Agent
        
        Args:
            api_key: AI provider API key
            model_name: Model name
            provider: 'gemini' or 'groq'
        """
        super().__init__(api_key, model_name, provider)
    
    def get_chat_response(self, message: str, language: str = "English") -> str:
        """
        Get response for a user chat message
        
        Args:
            message: User's chat message
            language: Preferred language
            
        Returns:
            AI response text
        """
        try:
            # Build prompt
            prompt = CHAT_RESPONSE_TEMPLATE.format(message=message)
            
            # Add language instruction if not English
            system_prompt = CHAT_SYSTEM_PROMPT
            if language and language.lower() != "english":
                system_prompt += f"\n\nIMPORTANT: Please respond in {language}."
            
            # Generate response
            response = self._generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7
            )
            
            return response
            
        except Exception as e:
            print(f"Error in ChatAgent: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again later."

    def generate_response(self, context: str, **kwargs) -> dict:
        """
        Implementation of abstract method from BaseAgent
        """
        message = context
        language = kwargs.get("language", "English")
        response = self.get_chat_response(message, language)
        return {"response": response}
