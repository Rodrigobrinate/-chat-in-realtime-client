import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Api from "./services/Api";
import { useCookies } from "react-cookie";
import io from "socket.io-client";
import isVisible from "./components/isVisible";

const socket = io("http://localhost:3002");
socket.on("connection", () => {
  console.log("connected");
});

function Home() {
  const [contacts, setContacts]: any = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact]: any = useState({});
  const [cookies, setCookie] = useCookies(["token","user_id",]);
  const [message, setMessage] = useState([]) as any;
  const [conversation, setConversation] = useState(0);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState(1);
  const lastRef = useRef(null) as any;
  const lastRef2 = useRef(null) as any;


/// verifica se o usuário está logado
  useEffect(() => {
    if (!cookies.token) {
      window.location.href = "/Login";
    }
  }, []);

  /// verifica se o elemento está visivel
  const isLastVisible = isVisible(lastRef2.current);

//// seta as mensgesn atenriores de acordo com o scoll
  useEffect(() => {
    if (isLastVisible) {

      previusMessage(contact, todos + 1, conversation)
     // console.log(conversation)
    }
  }, [isLastVisible]);
  
  const headers: any = {
    headers: {
      "Content-Type": "application/json",
      "x-access-token": cookies.token,
    },
  };

  /// busca os usuarios do chat
  function getAllContacts() {
    Api.get("/user")
      .then((res) => {
        setContacts({ user: res.data.users, type: "contact" });
      })
      .catch((err) => {
        console.log(err);
      });
  }



    /// busca as converisas do ususario
  function getAllConversations() {
    Api.get("/conversation", headers).then((res) => {
      let a = [] as any;
      res.data.conversations?.map((conversation: any) => {
        
        Api.get(`/message/lastmessage/${conversation.id}`, headers).then((res) => {
          console.log(res.data, conversation);
        if (conversation.user2.id != cookies.user_id * 1) {
          a.push(conversation.user2);
          setContacts({
            user: a,
            conversation: res.data.message.conversationId,
            type: "message",
            lastMessage: res.data,
          });
         setTimeout(() => {
          console.log(contacts);
         }, 1000); 
        } else {
          a.push(conversation.user1);
          setContacts({ user: a, conversation: res.data.message.conversationId, lastMessage: res.data, type: "message" });
          console.log(contacts);
        }})
      });
    });
  }


//// busca as mesnages  anteriores de acodrdo com o scoll



/// busca as ultimas mesagens que o usuario recebeu
  function newMessage(contact: any, page: number, conversationId?: any) {
    setTodos(page)
    const talk = document.getElementById(`talk`) as HTMLDivElement;
    talk.classList.remove("none");
    setContact(contact);
    setConversation(conversationId);

   
    ///  busca as mensagens
    console.log(conversationId);
    if (conversationId == 0 || conversationId == undefined) {
      console.log("não faz nada");
    } else {
      console.log(contact, conversationId);
      console.log( conversation);
      Api.get(`/message/${conversationId}/${page}`, headers).then((res) => {
         /// selciona a sala que quer escutar
    socket.emit("select_room", { room: conversationId }, (messages: any) => {
      console.log(messages);
    });

    console.log(res.data.messages.sort((a:any,b:any)=> a.id - b.id));
           setMessage(res.data.messages.sort((a:any,b:any)=> a.id - b.id) ); 
        
      });
    

      
  
    }




    
    

    /// escuta as mensagens que o usuario recebeu
    socket.on("message", (data: any) => {
          setMessage(data.data.sort((a:any,b:any)=> a.id - b.id));
       window.setTimeout(() => {
        lastRef.current?.scrollTo(0, lastRef.current?.scrollHeight)
       }, 100);  
      } );

    setContact(contact);
    setName(contact.name);
  }




  function  previusMessage(contact: any, page: number, conversationId?: any){
    setTodos(page)
    if (conversationId == 0 || conversationId == undefined) {} else {
    setTimeout(() => {
      console.log(message)
    }, 1000);  
        Api.get(`/message/${conversationId}/${page}`, headers).then((res) => {
          if (message){
            setMessage([ ...res.data.messages.sort((a:any,b:any)=> a.id - b.id), ...message,]);
          }else{
             setMessage(res.data.messages.sort((a:any,b:any)=> a.id - b.id) ); 
          }
         
          /// pega o tamanho do scroll antes de adicioar as mensagens
          const sch = lastRef.current?.scrollHeight
  
         ///seta o scroll para a posição que estava antes de concatenar as mensagens
          window.setTimeout(() => {
            lastRef.current?.scrollTo(0, lastRef.current?.scrollHeight - sch)
           }, 100);  
        });
      }
      setContact(contact);
      setName(contact.name);
  }
  


  /// envia as mensagens
  function sendMessageh() {

    const messageInput = document.getElementById(`message`) as HTMLInputElement;
    
    if (conversation == 0 || conversation == undefined) {
///cria uma nova conversa
Api.post(`/conversation/create`, { toId: contact.id }, headers).then((res) => {
  setConversation(res.data.conversation.id);


  let body = {
    text: text, //messageInput.value,
    userId: contact.id,
    conversationId: res.data.conversation.id,
  };

  Api.post("/message/create", body, headers).then((response) => {
   
    setTimeout(() => {
      newMessage(contact, 1, res.data.conversation.id);
      lastRef.current?.scrollTo(0, lastRef.current?.scrollHeight)
     }, 100);  
  });


  let data = {
    conversationId: res.data.conversation.id,
    toId: cookies.user_id,
    fromId: contact.id,
    text: messageInput.value,
    page: 1,
  };
  
   console.log(data)

   /// selciona a sala que quer escutar
//socket.emit("select_room", { room: conversation }, (messages: any) => {
 //console.log(messages);
  /// emite uma nova mensagem
    socket.emit("new", data);
//});

})
    }else{
    
    
let data = {
    conversationId: conversation,
    toId: cookies.user_id,
    fromId: contact.id,
    text: messageInput.value,
    id: message[message.length - 1]?.id + 1,
    page: 1,
  };
  

    /// emite uma nova mensagem
    socket.emit("new", data);

    /// salva a mesagens no banco de dados
    let body = {
      text: text, //messageInput.value,
      userId: contact.id,
    };
    Api.post("/message/create", body, headers).then((res) => {
   //   newMessage(contact, 1, conversation);
      setTimeout(() => {
        lastRef.current?.scrollTo(0, lastRef.current?.scrollHeight)
       }, 100);  
    });
    messageInput.value = "";

  }
  }

  return (
    <div className={styles.container}>


       {/* mesagens de conversas / contatos       */}
      <div className={styles.left_menu}>
        <h1>Chat</h1>
        <input type="text" placeholder="Search" className={styles.search} />
        <div className={styles.contacts}>
          <ul>
            <div>
              <button onClick={getAllContacts}>contacts</button>
              <button onClick={getAllConversations}>messages</button>
            </div>
            {contacts.user?.map((contact: any, index: number) => (
              <li
                key={contact.id}
                onClick={() => {
                  contacts.type !== "message"
                    ? newMessage(contact, 1)
                    : newMessage(contact,1,  contacts?.conversation);
                }}
              >
                <img src="/user.png" alt="" />
                <div>
                  <h4>{contact.name}</h4>
                  <p>{contacts.lastMessage?.message.text}</p>
                </div>
                <p>{new Date(contacts.lastMessage?.message.createdAt).getHours()+":"+new Date(contacts.lastMessage?.message.createdAt).getMinutes()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
   {/* /////////////////////////////////////////////////////////////////*/}


          {/* mesagens da conversa       */}
      <div className={`${styles.talk} none`} id="talk">
        <div className={styles.talk_header}>
          <img src="/user.png" width={"100px"} alt="" />
          <h4>{name}</h4>
          <div></div>
        </div>

        <ul id="ul" ref={lastRef}>
        <div ref={lastRef2} >não hà mensagens anteriores</div>
          {message?.map((item: any) =>
            item.toId == cookies.user_id ? (
              <li key={item.id} className={`${styles.li} right`}>
                <img src="/user.png" alt="" />
                {item.text}
              </li>
            ) : (
              <li key={item.id} className={`${styles.li} left`}>
                <img src="/user.png" alt="" />
                {item.text}
              </li>
            )
          )}
        </ul>

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Type a message"
            id="message"
            className={styles.input}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                sendMessageh();
              }
            }}
          />
          <button id="send" onClick={sendMessageh}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
