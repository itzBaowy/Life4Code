import styled from 'styled-components';

export const LoginWrapper = styled.div`
  @apply flex min-h-screen items-center justify-center bg-gray-100;
`;

export const LoginCard = styled.div`
  @apply bg-white shadow-lg rounded-lg p-8 w-full max-w-md;
`;

export const Title = styled.h2`
  @apply text-2xl font-bold mb-6 text-center text-gray-800;
`;

export const ErrorText = styled.p`
  @apply text-red-500 text-sm mb-4 text-center;
`;
