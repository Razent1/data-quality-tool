import './App.css';

import Form from 'react-bootstrap/Form';
import {useState} from "react";
import {setCheckers} from './store/exportData/exportData';
import {useDispatch, useSelector} from "react-redux";

function Checkbox() {
    const [typeInfo, setTypeInfo] = useState({
        duplication: false,
        nullCols: false,
        countRows: false,
        actualitySimple: false,
        actualityDifficulty: false
    });
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();


    return (
        <div style={{marginTop: '25px', marginLeft: '55px'}}>
            <div className="headings" style={{marginBottom: '20px'}}>
                Type of Checkers
            </div>
            <div className="dropdownBlock">
                <Form>
                    {['Duplications', 'Null in Columns', 'Count of rows', 'Actuality Simple', 'Actuality Difficulty']
                        .map((type) => (
                            <div key={`${type}default-checkbox`} className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id={`default-checkbox`}
                                    label={`${type}`}
                                    onClick={(e) => {
                                        if (type === "Duplications") {
                                            dispatch(setCheckers({
                                                ...exportData.checker,
                                                duplication: e.target.checked
                                            }))
                                        } else if (type === "Null in Columns") {
                                            dispatch(setCheckers({
                                                ...exportData.checker,
                                                nullCols: e.target.checked
                                            }))
                                        } else if (type === "Count of rows") {
                                            dispatch(setCheckers({
                                                ...exportData.checker,
                                                countRows: e.target.checked
                                            }))
                                        } else if (type === "Actuality Simple") {
                                            dispatch(setCheckers({
                                                ...exportData.checker,
                                                actualitySimple: e.target.checked
                                            }))
                                        } else if (type === "Actuality Difficulty") {
                                            dispatch(setCheckers({
                                                ...exportData.checker,
                                                actualityDifficulty: e.target.checked
                                            }))
                                        }
                                    }}
                                />
                            </div>
                        ))}
                </Form>
            </div>
        </div>
    )

}

export default Checkbox;