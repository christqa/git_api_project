import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IUser } from '@modules/user/user.type';
import { IMessageType } from '@modules/messages/messages.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const testUser: IUser = {
  id: 1,
  email: 'test-user@projectspectra.dev',
  authId: '',
  firstName: 'Austin',
  lastName: 'Gispanski',
  localCutoff: '',
  userGuid: 'ab098308-b546-4e58-ba36-a21137f78f72',
} as IUser;

describe('API Test Suite: Get Messages Endpoint', () => {
  //setup
  const messageType: IMessageType = {
    id: 1,
    text: 'occult blood detected',
    NotificationSettingsTypes: 'healthAlerts',
  };
  test('should be successful with valid parameters', (done) => {
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(testUser);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(testUser);

    //Setup
    prismaMock.account.findFirst.mockResolvedValue(testUser);
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(testUser);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(testUser);
    prismaMock.messageType.findFirst.mockResolvedValue(messageType);
    prismaMock.message.findFirst.mockResolvedValue(null);

    //When
    request(testApplication)
      .post(`/internal${Constants.MESSAGES_ENDPOINT}`)
      .send({
        timestamp: '2022-11-17T13:12:50.237Z',
        read: true,
        messageTypeId: 1,
        message: 'hello',
        title: 'its a message',
        messageGuid: '28d7de40-39fb-4dbc-b6da-1f2adcb68d5c',
        userGuid: 'ab098308-b546-4e58-ba36-a21137f78f72',
      })
      .expect(204, done);
  });

  test('testing without user', (done) => {
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(null);

    request(testApplication)
      .post(`/internal${Constants.MESSAGES_ENDPOINT}`)
      .send({
        timestamp: '2022-11-17T13:12:50.237Z',
        read: true,
        messageTypeId: 1,
        message: 'hello',
        title: 'its a message',
        messageGuid: '28d7de40-39fb-4dbc-b6da-1f2adcb68d5c',
        userGuid: 'ab098308-b546-4e58-ba36-a21137f78f72',
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(404);
          expect(response.body.message).toBe('User not found');
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing without messageType', (done) => {
    //setup
    prismaMock.account.findFirst.mockResolvedValue(testUser);
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(testUser);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(testUser);

    //when
    request(testApplication)
      .post(`/internal${Constants.MESSAGES_ENDPOINT}`)
      .send({
        timestamp: '2022-11-17T13:12:50.237Z',
        read: true,
        messageTypeId: 1,
        message: 'hello',
        title: 'its a message',
        messageGuid: '28d7de40-39fb-4dbc-b6da-1f2adcb68d5c',
        userGuid: 'ab098308-b546-4e58-ba36-a21137f78f72',
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(404);
          expect(response.body.message).toBe('Message type not found');
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
