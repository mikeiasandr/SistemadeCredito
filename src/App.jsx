import { useEffect, useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, addDoc } from "firebase/firestore";
import { query, where } from "firebase/firestore";


const firebaseApp = initializeApp({
  apiKey: "AIzaSyATEckzdvXKaKEejocI1NiQLxsklOkF5ic",
  authDomain: "sistema-de-credito-54377.firebaseapp.com",
  projectId: "sistema-de-credito-54377",
});


function App() {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [credit, setCredit] = useState("");
  const [user, setUser] = useState([]);
  const [usersCount, setUsersCount] = useState(0); // Contador de usuários
  const [searchCpf, setSearchCpf] = useState(""); // Novo estado para o CPF da busca


  const db = getFirestore(firebaseApp);
  const userCollectionRef = collection(db, "Users");

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef);
      console.log(data.docs.map((doc) => ({...doc.data(),id: doc.id})));
      setUser(data.docs.map((doc) => ({...doc.data(),id: doc.id})));
      setUsersCount(data.docs.length); // Atualiza a contagem
    };
    getUsers();
  },[]);

  async function criarUser(){
    if (!name || !cpf || !credit) {
      alert("Por favor, preencha todos os campos.");
      return; // Se algum campo estiver vazio, a função é interrompida
    }
  
    try {
      const user = await addDoc(userCollectionRef, {
        name, cpf, credit,
      });
      console.log(user);
  
      alert("Cliente adicionado com sucesso");
    } catch (error) {
      console.error("Erro ao adicionar cliente: ", error);
      alert("Ocorreu um erro ao adicionar o cliente.");
    }
   }

   async function buscarCliente() {
    if (searchCpf.trim() === "") {
      alert("Digite um CPF para buscar.");
      return;
    }

    const q = query(userCollectionRef, where("cpf", "==", searchCpf));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Nenhum cliente encontrado com esse CPF.");
        return;
      }

      // Atualiza a lista de usuários apenas com os encontrados
      setUser(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
    }
  }

  return (
    <>
      <div className="App">
        <div className='titulo'>
          <h1>Sistema de Crédito</h1>
          <h5>developed by Mikeias Andrade</h5>
        </div>
        <div className='areaConsulta'>
          <h2>Adicionar novo cliente</h2>
          <input className='input' type="text" placeholder='Nome completo' 
          value={name} onChange={(e) => setName(e.target.value)} />
          <input className='input' type="number" placeholder='CPF'
          value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <input className='input' type="number" placeholder='Crédito'
          value={credit} onChange={(e) => setCredit(e.target.value)} />
          <button className='botao' onClick={criarUser}>Adicionar</button>
        </div>
      </div>

      

      <div className='listInformation'>     
        <h2 className='clientesCount'> Clientes {usersCount}</h2>
        <div className='searchContainer'>
          <input
            className="search"
            type="text"
            placeholder="Buscar por CPF"
            value={searchCpf}
            onChange={(e) => setSearchCpf(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarCliente()} // Chama a função ao pressionar Enter
          />
          <button className="botao" id='buscar' onClick={buscarCliente}>Buscar</button>
        </div> 
      </div>

      <ul className='lista'>
        <div className='legenda'>
          <h3>NOME</h3>
          <h3>CPF</h3> 
          <h3>CRÉDITO</h3>
        </div>
          {user.map((user, index) => {
            return (
              <li key={user.id} className={index % 2 === 0 ? "par" : "impar"}>
                <p className='pName'> {user.name } </p>
                <p className='pCpf'>  {user.cpf} </p>
                <p> R${user.credit}</p>
              </li>
            )
          })}
      </ul>
    
    </>
  )
}

export default App
