import { SafeCompanyResponse } from 'src/companies/types/safeCompanyResponse.type';
import { Company } from 'src/companies/entities/company.entity';
import { toVisibleEvents } from './event.mapper';
import { CompanyForAdminResponse } from 'src/companies/types/companyForAdminResponse.dto';

export function mapCompanyProfileToDTO(
  dbCompany: Company,
  currentUserId?: number | null,
  isFollowing: boolean = false,
): SafeCompanyResponse {
  const isOwner = !!currentUserId && currentUserId === dbCompany.owner.id;
  const permissions = { owner: isOwner, admin: false };

  return {
    id: dbCompany.id,
    owner: {
      id: dbCompany.owner.id,
      login: dbCompany.owner.login,
      username: dbCompany.owner.username,
      avatar_url: dbCompany.owner.avatar_url,
    },
    name: dbCompany.name,
    email_for_info: dbCompany.email_for_info,
    location: dbCompany.location,
    description: dbCompany.description,
    picture_url: dbCompany.picture_url,
    is_following: isFollowing,
    events: toVisibleEvents(dbCompany.events ?? [], permissions, currentUserId),
    news: dbCompany.news
      ? dbCompany.news.map((news) => ({
          id: news.id,
          title: news.title,
          content: news.content,
          images_url: news.images_url,
          created_at: news.created_at,
          updated_at: news.updated_at,
        }))
      : [],
  };
}

export function mapCompanyForAdmin(company: Company): CompanyForAdminResponse {
  return {
    id: company.id,
    owner: {
      id: company.owner.id,
      login: company.owner.login,
      username: company.owner.username,
      avatar_url: company.owner.avatar_url,
    },
    name: company.name,
    email_for_info: company.email_for_info,
    location: company.location,
    description: company.description,
    picture_url: company.picture_url,
    created_at: company.created_at,
  };
}
