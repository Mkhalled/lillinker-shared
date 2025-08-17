import { ProfileData } from '@/types/company';

const CompanyInfoForm = ({ profile }: { profile: ProfileData }) => {
  const company = profile.roleData;
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="p-7">
        <form action="#">
          {/* Infos entreprise */}
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="name"
              >
                Nom de l&apos;entreprise
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]"
                type="text"
                name="name"
                id="name"
                placeholder="Nom de l'entreprise"
                defaultValue={company?.name || ''}
                readOnly
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label
                className="mb-3 block text-sm font-medium text-black dark:text-white"
                htmlFor="consultant_count"
              >
                Nombre de consultants
              </label>
              <input
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]"
                type="number"
                name="consultant_count"
                id="consultant_count"
                placeholder="Nombre de consultants"
                min={0}
                defaultValue={company?.consultant_count || ''}
                readOnly
              />
            </div>
          </div>
          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="siret"
            >
              SIRET
            </label>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]"
              type="text"
              name="siret"
              id="siret"
              placeholder="Numéro SIRET"
              defaultValue={company?.siret || ''}
              readOnly
            />
          </div>
          <div className="mb-5.5">
            <label
              className="mb-3 block text-sm font-medium text-black dark:text-white"
              htmlFor="description"
            >
              Description de l&apos;entreprise
            </label>
            <textarea
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[var(--primary-color)] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[var(--primary-color)]"
              name="description"
              id="description"
              placeholder="Description de l'entreprise"
              rows={3}
              defaultValue={company?.description || ''}
              readOnly
            />
          </div>
          <div className="flex justify-end gap-4.5">
            <button
              className="flex justify-center rounded bg-[var(--primary-color)] px-6 py-2 font-medium text-gray hover:bg-[var(--primary-hover)]"
              type="submit"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
