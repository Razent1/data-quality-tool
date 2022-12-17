import './App.css';
import classnames from 'classnames';


import Form from 'react-bootstrap/Form';
import {useEffect, useState} from "react";
import {
    setCheckers,
    setAllColumns,
    setColumns,
    deleteColumns,
    setNullColumns,
    deleteNullColumns,
    setActuality
} from './store/exportData/exportData';
import {useDispatch, useSelector} from "react-redux";
import {Dropdown} from "react-bootstrap";
import Select, {ActionMeta, OnChangeValue, StylesConfig} from 'react-select'

function Checkbox() {
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();

    useEffect(() => {
        async function fetchColumns() {
            if ((exportData.checker.duplication
                    || exportData.checker.nullCols
                    || exportData.checker.actualitySimple
                    || exportData.checker.actualityDifficulty)
                && exportData.db !== null && exportData.table !== null) {
                fetch("api/columns", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({'db': exportData.db, 'table': exportData.table})
                })
                    .then(response => response.json())
                    .then(response => dispatch(setAllColumns(response)))
            }
        }

        fetchColumns();
    }, [exportData.checker.duplication,
        exportData.db,
        exportData.table,
        exportData.checker.nullCols,
        exportData.checker.actualitySimple,
        exportData.checker.actualityDifficulty]);

    const selectorOnChangeDedup = (
        newValue,
        actionMeta
    ) => {
        switch (actionMeta.action) {
            case 'remove-value':
                dispatch(deleteColumns(actionMeta.removedValue.value));
                break;
            case 'pop-value':
                if (actionMeta.removedValue.value) {
                    dispatch(deleteColumns(actionMeta.removedValue.value));
                }
                break;
            case 'clear':
                newValue = [];
                break;
        }
        for (const el of newValue) {
            dispatch(setColumns(el.value));
        }

    };

    const selectorOnChangeNulls = (
        newValue,
        actionMeta
    ) => {
        switch (actionMeta.action) {
            case 'remove-value':
                dispatch(deleteNullColumns(actionMeta.removedValue.value));
                break;
            case 'pop-value':
                if (actionMeta.removedValue.value) {
                    dispatch(deleteNullColumns(actionMeta.removedValue.value));
                }
                break;
            case 'clear':
                newValue = [];
                break;
        }
        for (const el of newValue) {
            dispatch(setNullColumns(el.value));
        }

    };

    const duplicationColsSelector = () => {
        return (
            <div>
                {exportData.checker.duplication && exportData.allColumns === null && exportData.db !== null
                    && exportData.table !== null
                    && <Dropdown.Item> Loading... </Dropdown.Item>}
                {exportData.checker.duplication && exportData.allColumns !== null &&
                    <div>
                        <Select isMulti
                                name="Select_columns"
                                options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={selectorOnChangeDedup}
                        />
                    </div>
                }
            </div>
        )
    };

    const nullColsSelector = () => {
        return (
            <div>
                {exportData.checker.nullCols && exportData.allColumns === null && exportData.db !== null
                    && exportData.table !== null
                    && <Dropdown.Item> Loading... </Dropdown.Item>}
                {exportData.checker.nullCols === true && exportData.allColumns !== null &&
                    <div>
                        <Select isMulti
                                name="Select_columns"
                                options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={selectorOnChangeNulls}
                        />
                    </div>
                }
            </div>
        )
    };

    // const selectorOnChangeActuality = (newValue, actionMeta) => {
    //     if (exportData.checker.actualitySimple) {
    //         dispatch(setActuality({
    //             actualitySimple: newValue.value,
    //             actualityDifficulty: exportData.actuality.actualityDifficulty
    //         }));
    //     }
    //     if (exportData.checker.actualityDifficulty) {
    //         dispatch(setActuality({
    //             actualitySimple: exportData.actuality.actualitySimple,
    //             actualityDifficulty: newValue.value
    //         }));
    //     }
    // }

    const selectorOnChangeActualitySimple = (newValue, actionMeta) => {
        dispatch(setActuality({
            actualitySimple: newValue.value,
            actualityDifficulty: exportData.actuality.actualityDifficulty
        }));
    }

    const selectorOnChangeActualityDifficulty = (newValue, actionMeta) => {
        dispatch(setActuality({
            actualitySimple: exportData.actuality.actualitySimple,
            actualityDifficulty: newValue.value
        }));
    }

    const selectorActualitySimple = () => {
        if (exportData.checker.actualitySimple && exportData.allColumns === null && exportData.db !== null
            && exportData.table !== null) {
            return (<Dropdown.Item> Loading... </Dropdown.Item>)
        } else if (exportData.checker.actualitySimple && exportData.allColumns !== null) {
            return (
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    name="actuality_simple"
                    options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                    onChange={selectorOnChangeActualitySimple}
                />
            )
        }
    }

    const selectorActualityDifficulty = () => {
        if (exportData.checker.actualityDifficulty && exportData.allColumns === null && exportData.db !== null
            && exportData.table !== null) {
            return (<Dropdown.Item> Loading... </Dropdown.Item>)
        } else if (exportData.checker.actualityDifficulty && exportData.allColumns !== null) {
            return (
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    name="actuality_difficulty"
                    options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                    onChange={selectorOnChangeActualityDifficulty}
                />
            )
        }
    }

    // const selectorActuality = (actualityType) => {
    //     if (actualityType === 'Simple') {
    //         if (exportData.checker.actualitySimple && exportData.allColumns === null && exportData.db !== null
    //             && exportData.table !== null) {
    //             return (<Dropdown.Item> Loading... </Dropdown.Item>)
    //         } else if (exportData.checker.actualitySimple && exportData.allColumns !== null) {
    //             return (
    //                 <Select
    //                     className="basic-single"
    //                     classNamePrefix="select"
    //                     name="actuality_simple"
    //                     options={exportData.allColumns.map((col) => ({value: col, label: col}))}
    //                     onChange={selectorOnChangeActuality}
    //                 />
    //             )
    //         }
    //     } else {
    //         if (exportData.checker.actualityDifficulty && exportData.allColumns === null && exportData.db !== null
    //             && exportData.table !== null) {
    //             return (<Dropdown.Item> Loading... </Dropdown.Item>)
    //         } else if (exportData.checker.actualityDifficulty && exportData.allColumns !== null) {
    //             return (
    //                 <Select
    //                     className="basic-single"
    //                     classNamePrefix="select"
    //                     name="actuality_difficulty"
    //                     options={exportData.allColumns.map((col) => ({value: col, label: col}))}
    //                     onChange={selectorOnChangeActuality}
    //                 />
    //             )
    //         }
    //     }
    // }

    return (
        <div style={{marginTop: '25px', marginLeft: '55px'}}>
            <div className="headings" style={{marginBottom: '20px'}}>
                Type of Checkers
            </div>
            <div className={classnames("row", "dropdownBlock")}>
                <div className="col">
                    <Form>
                        {['Duplications', 'Null in Columns', 'Count of rows', 'Actuality Simple', 'Actuality Difficulty']
                            .map((type) => (
                                <div key={`${type}default-checkbox`} className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        id={`default-checkbox-${type}`}
                                        label={`${type}`}
                                        onClick={(e) => {
                                            if (type === "Duplications") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    duplication: e.target.checked
                                                }));
                                                dispatch(setColumns([]));
                                                // duplicationColsSelector();
                                            } else if (type === "Null in Columns") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    nullCols: e.target.checked
                                                }));
                                                dispatch(setNullColumns([]));
                                                // nullColsSelector();
                                            } else if (type === "Count of rows") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    countRows: e.target.checked
                                                }))
                                            } else if (type === "Actuality Simple") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    actualitySimple: e.target.checked
                                                }));
                                                dispatch(setActuality({
                                                    actualitySimple: null,
                                                    actualityDifficulty: exportData.actuality.actualityDifficulty
                                                }))
                                            } else if (type === "Actuality Difficulty") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    actualityDifficulty: e.target.checked
                                                }));
                                                dispatch(setActuality({
                                                    actualitySimple: exportData.actuality.actualitySimple,
                                                    actualityDifficulty: null
                                                }))
                                            }
                                        }}
                                    />
                                    {type === 'Duplications' && duplicationColsSelector()}
                                    {type === 'Null in Columns' && nullColsSelector()}
                                    {type === 'Actuality Simple' && selectorActualitySimple()}
                                    {type === 'Actuality Difficulty' && selectorActualityDifficulty()}
                                </div>
                            ))}
                    </Form>
                    {/*{console.log(exportData)}*/}
                </div>
            </div>
        </div>
    )

}

export default Checkbox;