import './App.css';
import classnames from 'classnames';


import Form from 'react-bootstrap/Form';
import {useEffect} from "react";
import {
    setCheckers,
    setAllColumns,
    setColumns,
    deleteColumns,
    setNullColumns,
    deleteNullColumns,
    setActuality, setPeriodActuality, setPeriodRows, setRowColumn, setDataOutlierColumn, setDataOutlierPeriod
} from './store/exportData/exportData';
import {useDispatch, useSelector} from "react-redux";
import {Dropdown} from "react-bootstrap";
import Select, {ActionMeta, OnChangeValue, StylesConfig} from 'react-select'

function Checkbox() {
    const exportData = useSelector(state => state.data);
    const dispatch = useDispatch();
    const typesOfCheckers = ['Duplications', 'Null in Columns', 'Count of rows', 'Actuality Simple', 'Actuality Difficulty', 'Data Outliers'];

    useEffect(() => {
        async function fetchColumns() {
            if ((exportData.checker.duplication
                    || exportData.checker.nullCols
                    || exportData.checker.actualitySimple
                    || exportData.checker.actualityDifficulty
                    || exportData.checker.countRows
                    || exportData.checker.dataOutliers)
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
        exportData.checker.actualityDifficulty,
        exportData.checker.countRows,
        exportData.checker.dataOutliers]);

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
    const selectorOnChangeRowColumns = (newValue, actionMeta) => {
        dispatch(setRowColumn(newValue.value));
    }

    const selectorOnChangeDataOutlierColumn = (newValue, actionMeta) => {
        dispatch(setDataOutlierColumn(newValue.value));
    }

    const handleInputChangeActuality = (event) => {
        const {value} = event.target
        dispatch(setPeriodActuality(value));
    }

    const handleInputChangeRows = (event) => {
        const {value} = event.target
        dispatch(setPeriodRows(value));
    }

    const handleInputChangeDataOutliers = (event) => {
        const {value} = event.target
        dispatch(setDataOutlierPeriod(value));
    }

    const selectorRowColumn = () => {
        if (exportData.checker.countRows && exportData.allColumns === null && exportData.db !== null
            && exportData.table !== null) {
            return (<Dropdown.Item> Loading... </Dropdown.Item>)
        } else if (exportData.checker.countRows && exportData.allColumns !== null) {
            return (
                <div>
                    <Form.Label htmlFor="periodDays">Choose period of days</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter period in days"
                        name="Period Name"
                        value={exportData.periodRows}
                        onChange={handleInputChangeRows}
                    />
                    <div>Choose column</div>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        name="actuality_simple"
                        options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                        onChange={selectorOnChangeRowColumns}
                    />
                </div>
            )
        }
    }

    const selectorActualitySimple = () => {
        if (exportData.checker.actualitySimple && exportData.allColumns === null && exportData.db !== null
            && exportData.table !== null) {
            return (<Dropdown.Item> Loading... </Dropdown.Item>)
        } else if (exportData.checker.actualitySimple && exportData.allColumns !== null) {
            return (
                <div>
                    <Form.Label htmlFor="periodDays">Choose period of days</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter period in days"
                        name="Period Name"
                        value={exportData.periodActuality}
                        onChange={handleInputChangeActuality}
                    />
                    <div>Choose column</div>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        name="actuality_simple"
                        options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                        onChange={selectorOnChangeActualitySimple}
                    />
                </div>
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

    const selectorDataOutliers = () => {
        if (exportData.checker.dataOutliers && exportData.allColumns === null && exportData.db !== null
            && exportData.table !== null) {
            return (<Dropdown.Item> Loading... </Dropdown.Item>)
        } else if (exportData.checker.dataOutliers && exportData.allColumns !== null) {
            return (
                <div>
                    <Form.Label htmlFor="periodDays">Choose period of days</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter period in days"
                        name="Period Name"
                        value={exportData.periodDataOutliers}
                        onChange={handleInputChangeDataOutliers}
                    />
                    <div>Choose column</div>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        name="data_outliers"
                        options={exportData.allColumns.map((col) => ({value: col, label: col}))}
                        onChange={selectorOnChangeDataOutlierColumn}
                    />
                </div>
            )
        }
    }

    return (
        <div style={{marginTop: '25px', marginLeft: '55px'}}>
            <div className="headings" style={{marginBottom: '20px'}}>
                Type of Checkers
            </div>
            <div className={classnames("row", "dropdownBlock")}>
                <div className="col">
                    <Form>
                        {typesOfCheckers
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
                                            } else if (type === "Null in Columns") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    nullCols: e.target.checked
                                                }));
                                                dispatch(setNullColumns([]));
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
                                            } else if (type === "Data Outliers") {
                                                dispatch(setCheckers({
                                                    ...exportData.checker,
                                                    dataOutliers: e.target.checked
                                                }));
                                            }
                                        }}
                                    />
                                    {type === 'Duplications' && duplicationColsSelector()}
                                    {type === 'Null in Columns' && nullColsSelector()}
                                    {type === 'Count of rows' && selectorRowColumn()}
                                    {type === 'Actuality Simple' && selectorActualitySimple()}
                                    {type === 'Actuality Difficulty' && selectorActualityDifficulty()}
                                    {type === 'Data Outliers' && selectorDataOutliers()}
                                </div>
                            ))}
                    </Form>
                </div>
            </div>
        </div>
    )

}

export default Checkbox;