import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import {useState, useEffect} from "react";
import {Button} from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import {setDatabase, setTable, setCheckerName, setFiltrationCondition} from './store/exportData/exportData';


function Chosers() {
    const [itemsDB, setItemsDb] = useState([]);
    const [dbSchemas, setSchema] = useState([]);
    const [checker, setChecker] = useState("");
    const [filtration, setFiltration] = useState("");
    const [ready, setReady] = useState(false);
    const [data, setData] = useState('');
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();



    useEffect(() => {
        async function fetchDb() {
        fetch('api/databases')
            .then(response => response.json())
            .then(response => setItemsDb(response))
        }
        fetchDb();
    }, [])

    useEffect(() => {
       async function fetchTables() {
           if (exportData.db !== null) {
            await fetch("api/tables", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({'db': exportData.db})
            })
                .then(response => response.json())
                .then(response => setSchema(response))
                .then(() => setReady(true));
        }
       }
       fetchTables();
    }, [exportData.db])

    const onSubmitButton = () => {
        dispatch(setCheckerName(checker));
        dispatch(setFiltrationCondition(filtration));
    }

    const handleInputChangeChecker = (event) => {
        const { value } = event.target
        setChecker(value);
    }

    const handleInputChangeFiltration = (event) => {
        const { value } = event.target
        setFiltration(value);
    }

    return (
        <>
        <div>
            <div className="dropdownBlock">
            <div className="headings">
                Select Database
            </div>
                <Dropdown>
                    <Dropdown.Toggle variant="outline-dark" style={{marginBottom: '10px', width:'100%',
                        display:'block'}}>Choose from the list</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {itemsDB.length === 0 && <Dropdown.Item> Loading... </Dropdown.Item>}
                        {itemsDB.length > 0 && itemsDB.map((itemsDB) => (
                            <Dropdown.Item onClick={() => {
                                if (itemsDB !== exportData.db) {
                                    dispatch(setDatabase(itemsDB));
                                    setReady(false);}
                            }}>
                                {itemsDB}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <pre>Selected DB: {exportData.db}</pre>
            </div>
            <div className="dropdownBlock">
                <div className="headings">
                   Select Table
                </div>

                <Dropdown >
                    <Dropdown.Toggle variant="outline-dark" style={{marginBottom: '10px', width:'100%',
                        display:'block'}}>Choose from the list</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {exportData.db === null && <Dropdown.Item> Database not selected </Dropdown.Item>}
                        {(!ready && exportData.db !== null) && <Dropdown.Item> Loading... </Dropdown.Item>}
                        {ready && dbSchemas.map((dbSchema) => (
                            <Dropdown.Item onClick={() => dispatch(setTable(dbSchema))}>
                                {dbSchema}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <pre>Defualt selected Schema: {exportData.table}</pre>
            </div>
            <div className="dropdownBlock">
                <Form.Label htmlFor="nameChecker">Name of Checker</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter checker name"
                    name="Checker name"
                    value={checker}
                    onChange={handleInputChangeChecker}
                />
            </div>
            <div className="dropdownBlock">
                <Form.Label htmlFor="nameCondition">Filtration condition</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter filtration condition"
                    name="Filtration condition"
                    value={filtration}
                    onChange={handleInputChangeFiltration}
                />
            </div>
                <div className="d-grid gap-2" style={{alignSelf: "flex-end"}}>
                    <Button variant="primary" size="lg" onClick={onSubmitButton}>
                        Make a check
                    </Button>{' '}
                </div>
            </div>
            </>
    );
}

export default Chosers;
