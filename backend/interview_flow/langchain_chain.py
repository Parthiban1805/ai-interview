from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from langchain.memory import ConversationBufferMemory
from config import settings

# Initialize the Groq Chat client instead of Ollama
# Llama3-8b-8192 is one of the fastest and most capable models available on Groq
llm = ChatGroq(
    temperature=0.7,
    model_name="llama3-8b-8192",
    api_key=settings.groq_api_key,
)

def create_interview_chain(system_prompt: str, memory: ConversationBufferMemory):
    """
    Creates the LangChain conversation chain using the high-speed Groq model.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ])
    
    chain = (
        RunnablePassthrough.assign(
            history=lambda x: memory.load_memory_variables(x)["history"]
        )
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain