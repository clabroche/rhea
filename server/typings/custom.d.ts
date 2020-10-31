
declare namespace Express {
  export interface Request {
    user: User;
  }
}

interface User {
  _id: ObjectID;
}