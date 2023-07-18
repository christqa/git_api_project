const includeCriteria = {
  toGroup: {
    select: {
      groupName: true,
    },
  },
  fromUser: {
    select: {
      profile: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
  toUser: {
    select: {
      profile: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  },
};

export { includeCriteria };
