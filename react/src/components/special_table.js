import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import server from '../constants/server';

function createData(array, headers) {
    const obj = {};
    headers.forEach(header => {
        obj[header] = array.shift();
    })
  return obj;
}

function descendingComparator(a, b, orderBy) {
  let newA = a[orderBy];
  let newB = b[orderBy];
  try{
    newA = newA.split('%')[0];
    newB = newB.split('%')[0];
    newA = parseFloat(newA);
    newB = parseFloat(newB);
  } catch(ignored) {

  }
  if (newB < newA) {
    return -1;
  }
  if (newB > newA) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function SpecialTable(props) {
    const rows = [];
    props.rows.forEach(row => {
        const elements = [];
        props.elements.forEach(element => {
            elements.push(row[element]);
        });
        rows.push(createData(elements, props.headers, row.id, row.new));
    });
    const headCells = [];
    props.headers.forEach(header => {
        headCells.push({ id: header, numeric: false, disablePadding: false, label: header});
    });
    const { primaryKey, orderCol, orderDir } = props;
  const classes = useStyles();
  const [order, setOrder] = React.useState(orderDir);
  const [orderBy, setOrderBy] = React.useState(orderCol);
  const [selected, setSelected] = React.useState([]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headCells={headCells}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .map(row => {
                  return (
                    <TableRow
                      tabIndex={-1}
                      key={row[primaryKey]}
                    >
                        {
                            props.headers.map(header => {
                              if(header === 'Unit') {
                                return (<TableCell align="center" key={header}><div className="champion"><img className="champion-icon" src={server + '/champions/' + row[header].toLowerCase() + '.png'} alt="" /> {row[header]}</div></TableCell>);
                              }
                              if(header === 'Items') {
                                return (<TableCell align="center" key={header}>
                                  <div className="items">
                                    {row[header].map(item => {
                                      return(
                                      <div className="item" key={item.id}>
                                        <img className="item-icon"  src={server + '/items/' + (item.id > 9 ? item.id : '0' + item.id) + '.png'} alt="" />
                                        <span>{item.percent}</span>
                                      </div>
                                      )
                                    })}
                                  </div>
                                </TableCell>);
                              }
                              return (<TableCell align="center" key={header}>{row[header]}</TableCell>);
                            })
                        }
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}