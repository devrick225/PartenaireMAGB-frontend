import { combineReducers } from 'redux';
import { readMessageReducer } from './message/reducers';
import { readNotificationReducer } from './notification/reducers';
import authReducer from './authentication/reducers';
import ChangeLayoutMode from './themeLayout/reducers';
import tickets from './supportTickets/reducers';
import profile from './profile/reducers';
import donations from './donations/reducers';
import payments from './payments/reducers';
import users from './users/reducers';

const rootReducers = combineReducers({
  message: readMessageReducer,
  tickets,
  profile,
  donations,
  payments,
  users,
  notification: readNotificationReducer,
  auth: authReducer,
  ChangeLayoutMode,
});

export default rootReducers;
