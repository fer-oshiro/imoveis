// Interfaces
export * from './interfaces/base-repository.interface'

// Abstract classes
export * from './repositories/base-repository.abstract'

// Errors
export * from './errors/domain-error'
export * from './errors/error-handler'

// Value Objects
export * from './vo/entity-metadata.vo'
export * from './vo/contact-info.vo'
export * from './vo/phone-number.vo'
export * from './vo/cpf.vo'
export * from './vo/cnpj.vo'
export * from './vo/document.vo'

// Query Result Models
export * from './models/query-result.models'

// Utilities
export * from './utils/data-mapper.utils'

// Aggregation Services
export * from './services/apartment-aggregation.service'
export * from './services/user-aggregation.service'
export * from './services/payment-aggregation.service'
