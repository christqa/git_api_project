import agreementService from './agreements.service';
import agreementsRepository from '@repositories/agreements.repository';
import referenceDataRepository from '@repositories/reference-data.repository';
import prisma from '@core/prisma/prisma';
import { agreementTypes } from '@modules/agreements/agreements.type';
const createAgreementRequestDto = {
  links: [
    {
      isoLocale: 'zh',
      url: 'https://static.projectspectra.dev/terms/v1.html?v=4',
    },
    {
      isoLocale: 'en',
      url: 'https://static.projectspectra.dev/terms/v1.html?v=4',
    },
  ],
  version: 6,
  agreementType: agreementTypes.termsAndConditions,
};

const mockAgreement = {
  id: 4,
  agreementType: agreementTypes.termsAndConditions,
  version: 3,
  url: 'string',
  localeIso: 'string',
};
describe('agreements module service', () => {
  it('should create agreement successfully', async () => {
    jest.spyOn(agreementsRepository, 'find').mockResolvedValue([]);
    jest
      .spyOn(agreementsRepository, 'createMany')
      .mockResolvedValue({ count: 1 });
    jest.spyOn(referenceDataRepository, 'incrementVersion').mockResolvedValue({
      id: 1,
      version: 1,
    });
    jest.spyOn(prisma, '$transaction').mockResolvedValue({ count: 1 });
    const createAgreement = agreementService.createAgreements(
      createAgreementRequestDto
    );
    await expect(createAgreement).resolves.not.toThrow();
  });

  it('should throw duplicate exception', async () => {
    jest.spyOn(agreementsRepository, 'find').mockResolvedValue([mockAgreement]);
    const createAgreement = agreementService.createAgreements(
      createAgreementRequestDto
    );
    await expect(createAgreement).rejects.toThrow();
  });

  it('should throw error', async () => {
    jest.spyOn(agreementsRepository, 'find').mockResolvedValue([]);
    jest.spyOn(agreementsRepository, 'createMany').mockRejectedValue(false);
    const createAgreement = agreementService.createAgreements(
      createAgreementRequestDto
    );
    await expect(createAgreement).rejects.toThrow();
  });
});
