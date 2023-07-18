export interface IUpdateUserProfileRequestDto {
  firstName: string;
  lastName: string;
  profile: {
    dob: string;
    regionalPref: string;
    weightLbs?: number;
    heightIn?: number;
    genderId: number;
    lifeStyleId?: number;
    exerciseIntensityId?: number;
    medicalConditionIds?: number[];
    medicationIds?: number[];
    urinationsPerDayId?: number;
    bowelMovementId?: number;
  };
}
