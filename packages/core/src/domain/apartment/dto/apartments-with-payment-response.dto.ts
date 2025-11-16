import { z } from 'zod'

import { ApartmentResponse } from './apartment-response.dto'
import { ContractResponse } from '../../contract'
import { UserResponse } from '../../user/dto/user-response.dto'

export const ApartmentWithPaymentResponseDto = z.object({
  apartment: ApartmentResponse,
  contract: ContractResponse.optional(),
  user: UserResponse.optional(),
})
