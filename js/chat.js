let isEnterDisabled = false;

$(document).ready(function () {
  let agentId = localStorage.getItem("agent_id");
  //const agentId = "agent-1f2e2c4b-8c18-4b52-9dc5-b5305624b2a2";
  const jwtToken = localStorage.getItem("access_token");

  // Function to fetch messages from the API
  function getMessages() {
    const checkAgentId = setInterval(() => {
      agentId = localStorage.getItem("agent_id");
      
      if (agentId !== null) {
        clearInterval(checkAgentId);
        console.log("Agent ID is now set:", agentId);
        let url = `https://server.askyla.com/api/chat/messages?agent_id=${agentId}&limit=1000&msg_object=true`;
        console.log(url);   
        $.ajax({
          
          url: url,
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          success: function (response) {
            // Process and display the messages
            console.log(response);
            processMessages(response);
          },
          error: function (error) {
            console.error("Error fetching messages:", error);
            alert("Failed to fetch messages. Please try again.");
          },
        });
        // Proceed with your logic here
      }
    }, 100); // Check every 100 milliseconds
    
  }
  function trimNewlines(jsonString) {
    try {
      // Ensure it starts with '{' and ends with '}'
      if (jsonString.startsWith("{\n")) {
          jsonString = jsonString.replace(/^\{\n/, "{");
      }
      if (jsonString.endsWith("\n}")) {
          jsonString = jsonString.replace(/\n}$/, "}");
      }

      // Escape unescaped newlines inside string values
      jsonString = jsonString.replace(/(?<!\\)\n/g, "<br>");

      // Parse the sanitized JSON string
      return jsonString;
  } catch (error) {
      console.error("Invalid JSON:", error);
      return null;
  }
  }
  function displayMessages(messages) {
    const chatContainer = $("#chat-container"); // assuming you have a div with this ID
    chatContainer.empty();
  
    messages.forEach((msg) => {
      const messageHtml = `<div class="${msg.isUser ? 'user-message' : 'assistant-message'}">
        <p>${msg.text}</p>
      </div>`;
      chatContainer.append(messageHtml);
    });
  }
  function processMessages(response) {
    // Filter out only user and assistant messages
    const filteredMessages = response.filter(
      (msg) =>
        msg.message_type === "user_message" ||
        msg.message_type === "assistant_message"
    );
  
    let firstUserSkipped = false;
    let firstAssistantSkipped = false;
  
    // Display each message, skipping the first of each type
    filteredMessages.forEach((msg) => {
      if (msg.message_type === "user_message") {
        if (!firstUserSkipped) {
          firstUserSkipped = true;
          return; // skip first user message
        }
        addMessage(msg.content, true);
      } else if (msg.message_type === "assistant_message") {
        if (!firstAssistantSkipped) {
          firstAssistantSkipped = true;
          return; // skip first assistant message
        }
        addMessage(msg.content, false);
      }
    });
  }
  
  
  
  function processMessages1(response) {
    const filteredMessages = response.filter(
      (message) => message.role === "assistant" || message.role === "user"
    );

    const reversedMessages = filteredMessages.reverse();

    const messagesToProcess = reversedMessages.slice(2);
    const initialMessages = messagesToProcess.map((message) => {
      if (message.role === "user") {
        const parsedData = JSON.parse(message.text);
        const messageNew = parsedData.message;
        return {
          text: messageNew,
          isUser: message.role === "user",
        };
      } else {
        const parsedData =  message.tool_calls[0].function.arguments;
        let cleanedJson = trimNewlines(parsedData);
        const messageNew = JSON.parse(cleanedJson).message;
        return {
          text: messageNew,
          isUser: message.role === "user",
        };
      }
    });

    initialMessages.forEach((msg) => {
      addMessage(msg.text, msg.isUser);
    });
  }
  getMessages();
});

const chatContainer = document.getElementById("chatContainer");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

// Function to disable the Enter key
function disableElements() {
  isEnterDisabled = true;
  sendButton.disabled = true;
}
function enableElements() {
  isEnterDisabled = false;
  sendButton.disabled = false;
}

function addMessage(text, isUser) {
  if (text === "") {
    return;
  }
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
  messageDiv.innerHTML = text;
  chatContainer.appendChild(messageDiv);

  const wrapper = document.querySelector(".chat-container-wrapper");
  wrapper.scrollTop = wrapper.scrollHeight;
}

function showTypingIndicator() {
  const indicatorDiv = document.createElement("div");
  indicatorDiv.className = "message ai-message";
  indicatorDiv.innerHTML = `
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            `;
  chatContainer.appendChild(indicatorDiv);

  const wrapper = document.querySelector(".chat-container-wrapper");
  wrapper.scrollTop = wrapper.scrollHeight;

  return indicatorDiv;
}

function sendMessage() {
  disableElements();
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  messageInput.value = "";

  const typingIndicator = showTypingIndicator();

  const agentId = localStorage.getItem("agent_id");
  const url = `https://server.askyla.com/api/chat/send_messages/${agentId}`;

  // Prepare the data payload
  const data = JSON.stringify({
    messages: [
      {
        role: "user",
        "content": [
          {
            "type": "text",
            "text": text
          }
        ]
      },
    ],
    stream_steps: true,
    stream_tokens: true,
  });
  let allInternalMonologues = "";
  $.ajax({
    url: url,
    type: "POST",
    data: data,
    contentType: "application/json",
    processData: false,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Bearer your_token");
    },
    success: function (response) {
      let parsedResponse = typeof response === "string" ? JSON.parse(response) : response;

      let allInternalMonologues = '';

      // Log the parsed JSON response
      console.log(parsedResponse);

      // Check if messages exist in the parsed response and extract assistant_message content
      if (parsedResponse.messages && Array.isArray(parsedResponse.messages)) {
          parsedResponse.messages.forEach(message => {
              if (message.message_type === "assistant_message") {
                  allInternalMonologues += message.content + '\n'; // Add message content
              }
          });
      }

      // Log all internal monologues
      typingIndicator.remove();
      addMessage(allInternalMonologues, false);
      enableElements();
    },
    error: function (xhr, status, error) {
      console.error("API call failed: ", status, error);
      alert("Error: " + error);
    },
  });
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (isEnterDisabled && e.key === "Enter") {
    e.preventDefault(); // Prevent the Enter key from triggering the sendMessage
  } else if (e.key === "Enter") {
    sendMessage();
  }
});
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("agent_id");
  localStorage.removeItem("user_email");

  alert("You have been logged out successfully.");

  window.location.href = "index.html";
}
