//UTILITY FUNCTIONS
//import _ from 'lodash';
import {loadconfirm, redirect} from '../scripts/utility/utilities'
import mobileAndTabletCheck from '../scripts/utility/utilities'
var port = process.env.port || 5500;


mobileAndTabletCheck();
redirect();
loadconfirm();
app.listen(port);

 













