import React from 'react';
import {
  connect
} from 'react-redux';
import {
  Icon,
  Input,
  Table,
  Button,
  Tag,
} from 'antd';
import {
  map,
} from 'lodash';
import {
  CSVLink,
} from "react-csv";

import rsvpStateBranch from '../../state/rsvps';

import './style.scss';

class RSVPTable extends React.Component {

    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
        this.state = {
            filteredInfo: null,
            sortedInfo: null,
            editing: null,
        };
    }

    componentDidMount() {
        const { 
            requestRsvps
        } = this.props;
        requestRsvps();
    }

    handleChange (pagination, filters, sorter) {
        this.setState({
        filteredInfo: filters,
        sortedInfo: sorter,
        });
    }

    handleReset (clearFilters) {
        clearFilters();
        this.setState({
        searchText: ''
        });
    }

    handleSearch (selectedKeys, confirm) {
        confirm();
        this.setState({
        searchText: selectedKeys[0]
        });
    }

    expandedRowRender(record) {
        const columns = [
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                }, {
                  title: 'Time',
                  dataIndex: 'time',
                  key: 'time',
                }, {
                  title: 'Location',
                  dataIndex: 'location',
                  key: 'location',
                },
        ];

    return (
      <Table
        columns={columns}
        rowKey={(record) => `${record.email_address}-${record.eventId}`}
        dataSource={[record]}
        pagination={false}
      />
    );
  };

  render() {
    const {
        allRsvpsForCsv,
        allCurrentRsvps,
        allCurrentRsvpsForCsv,
    } = this.props;
    const columns = [
        {
      title: 'Name',
      dataIndex: 'given_name',
      key: 'given_name',
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        if (a.given_name > b.given_name) {
          return -1
        } else if (a.given_name < b.given_name) {
          return 1
        }
        return 0
      },
      sortDirections: ['descend', 'ascend'],
    }, 
    {
        title: 'Last Name',
        dataIndex: 'family_name',
        key: 'family_name',
        defaultSortOrder: 'descend',
        sorter: (a, b) => {
        if (a.family_name > b.family_name) {
            return -1
        } else if (a.family_name < b.family_name) {
            return 1
        }
        return 0
        },
        sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Email',
      dataIndex: 'email_address',
      key: 'email_address',
      filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node; }}
          placeholder={`Search email`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.email && record.email.toString().toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    }, {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Contact',
      dataIndex: 'can_contact',
      key: 'can_contact',
      render: (can_contact) => (
          <span>
            {map(can_contact, (contact, type) => {
                  const color = contact ? 'green' : 'red';
                  const falseTagText = {
                      can_text: 'No text',
                      can_email: 'No email',
                      partner: 'Partners can\'t contact'
                  }
                  return contact ? (
                    <Tag color={color} key={type}>{type}</Tag>) : 
                    (<Tag color={color} key={type}>{falseTagText[type]}</Tag>)
                })}
        </span>)
    },
    {
        title: 'Event id',
        dataIndex: 'eventId',
        key: 'eventId',
    },
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
    },

    ];
    return (
        <div>
            <Button.Group
                className="download-table-button-group"
            >
                <Button 
                    icon="download"
                >
                    <CSVLink 
                        data={allCurrentRsvpsForCsv}
                        filename="Current_RSVPs.csv"
                    > RSVPs for current events
                    </CSVLink>
                </Button>
                <Button
                    icon="download"
                >
                    <CSVLink 
                        data={allRsvpsForCsv}
                        filename="All_RSVPs.csv"
                    > All RSVPs (including past events)
                    </CSVLink>
                </Button>
        
            </Button.Group>
            <div className="researcher-table">
                <Table 
                    columns={columns} 
                    dataSource={allCurrentRsvps}
                    rowKey={(record) => record.email_address}
                    loading={!allCurrentRsvps.length}
                    expandedRowRender={(record => this.expandedRowRender(record))}
                />
            </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
    allRsvps: rsvpStateBranch.selectors.getAllRsvps(state),
    allRsvpsForCsv: rsvpStateBranch.selectors.getAllRsvpsForCsv(state),
    allCurrentRsvps: rsvpStateBranch.selectors.getAllCurrentRsvps(state),
    allCurrentRsvpsForCsv: rsvpStateBranch.selectors.getAllCurrentRsvpsForCsv(state),
});

const mapDispatchToProps = dispatch => ({
  requestRsvps: () => dispatch(rsvpStateBranch.actions.requestAllRsvps()),
});

export default connect(mapStateToProps, mapDispatchToProps)(RSVPTable);
