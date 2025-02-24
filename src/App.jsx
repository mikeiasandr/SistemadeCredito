import { useEffect, useState } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, addDoc, query, where, orderBy, startAfter, limit } from "firebase/firestore";

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
  const [usersCount, setUsersCount] = useState(0);
  const [searchCpf, setSearchCpf] = useState("");

  const [lastDoc, setLastDoc] = useState(null);
  const [prevDocs, setPrevDocs] = useState([]); 
  const usersPerPage = 9;

  const db = getFirestore(firebaseApp);
  const userCollectionRef = collection(db, "Users");

  const fetchTotalUsers = async () => {
    const data = await getDocs(userCollectionRef);
    setUsersCount(data.docs.length); // Atualiza a contagem total de usuários
  };

  const fetchUsers = async (next = true) => {
    let q;
    if (next) {
      q = lastDoc
        ? query(userCollectionRef, orderBy("name"), startAfter(lastDoc), limit(usersPerPage))
        : query(userCollectionRef, orderBy("name"), limit(usersPerPage));
    } else {
      q = query(userCollectionRef, orderBy("name"), limit(usersPerPage));
    }
  
    const data = await getDocs(q);
    if (!data.empty) {
      if (!next) {
        setPrevDocs([]);
      } else {
        setPrevDocs([...prevDocs, lastDoc]);
      }
      setUser(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLastDoc(data.docs[data.docs.length - 1]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTotalUsers(); // Atualiza a contagem total de clientes
  }, []);

  const previousPage = () => {
    if (prevDocs.length > 0) {
      setLastDoc(prevDocs[prevDocs.length - 1]);
      setPrevDocs(prevDocs.slice(0, -1));
      fetchUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function criarUser() {
    if (!name || !cpf || !credit) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    try {
      await addDoc(userCollectionRef, { name, cpf, credit });
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
          <input className='input' type="text" placeholder='Nome completo' value={name} onChange={(e) => setName(e.target.value)} />
          <input className='input' type="number" placeholder='CPF' value={cpf} onChange={(e) => setCpf(e.target.value)} />
          <input className='input' type="number" placeholder='Crédito' value={credit} onChange={(e) => setCredit(e.target.value)} />
          <button className='botao' onClick={criarUser}>Adicionar</button>
        </div>
      </div>

      <div className='listInformation'>     
        <h2 className='clientesCount'> Clientes {usersCount}</h2>
        <div className='searchContainer'>
          <input className="search" type="text" placeholder="Buscar por CPF" value={searchCpf} onChange={(e) => setSearchCpf(e.target.value)} onKeyDown={(e) => e.key === "Enter" && buscarCliente()} />
          <button className="botao" id='buscar' onClick={buscarCliente}>Buscar</button>
        </div> 
      </div>

      <ul className='lista'>
        <div className='legenda'>
          <h3>NOME</h3>
          <h3>CPF</h3> 
          <h3>CRÉDITO</h3>
        </div>
        {user.map((user, index) => (
          <li key={user.id} className={index % 2 === 0 ? "par" : "impar"}>
            <p className='pName'> {user.name} </p>
            <p className='pCpf'>  {user.cpf} </p>
            <p> R${user.credit}</p>
          </li>
        ))}
      </ul>

      <div className='pagination'>
        <button className='back' onClick={previousPage} disabled={prevDocs.length === 0}> &lt;</button>
        <button onClick={() => fetchUsers(true)}>&gt;</button>
      </div>
    </>
  );
}

export default App;
