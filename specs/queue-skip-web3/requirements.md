# Requirements Document

## Introduction

The Queue Skip Web3 system is a highly configurable queue management platform that allows users to skip queues at various locations using digital passes. The system is designed to work across diverse contexts - from public transit stations and commercial buildings to tourist attractions and government facilities - with administrators having full control over feature enablement, pass distribution policies, authentication methods, and access rules. HKU station serves as the initial implementation case study, but the platform's flexibility allows deployment in any queue-prone environment globally.

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to configure pass allocation policies for my venue so that I can control how passes are distributed to different user groups.

#### Acceptance Criteria

1. WHEN configuring a venue THEN the system SHALL allow administrators to define pass types (e.g., Standard, Fast, One-time)
2. WHEN setting allocation rules THEN the system SHALL allow administrators to specify quantity, validity periods, and usage restrictions per user group
3. WHEN allocation periods are defined THEN the system SHALL automatically distribute passes according to configured schedules
4. WHEN passes are allocated THEN the system SHALL record the allocation on-chain for transparency
5. WHEN passes have expiration dates THEN the system SHALL send configurable reminder notifications to users with unused passes

### Requirement 2

**User Story:** As a system administrator, I want to configure authentication methods for my venue so that I can control how users access the system based on my security and access requirements.

#### Acceptance Criteria

1. WHEN configuring authentication THEN the system SHALL support multiple authentication methods (SSO, government ID, email, Web3 wallet)
2. WHEN SSO is enabled THEN the system SHALL integrate with the specified identity provider (e.g., HKU SSO, corporate SSO)
3. WHEN government ID verification is enabled THEN the system SHALL require and validate ID numbers to prevent multiple accounts
4. WHEN authentication is successful THEN the system SHALL assign users to appropriate groups based on administrator-defined rules
5. WHEN multiple authentication methods are available THEN the system SHALL allow administrators to set priority and fallback options

### Requirement 3

**User Story:** As a pass user, I want to participate in an optional survey about my intended usage time so that the system can provide better queue predictions for all users.

#### Acceptance Criteria

1. WHEN a user requests a Standard Pass THEN the system SHALL present an optional survey about intended usage session
2. WHEN presenting the survey THEN the system SHALL offer time slot options (30-minute sessions during rush hours, 1-hour sessions during off-peak)
3. WHEN a user completes or skips the survey THEN the system SHALL generate a QR code ticket
4. WHEN survey data is collected THEN the system SHALL aggregate anonymous usage predictions for all users to view

### Requirement 4

**User Story:** As any app user, I want to see queue predictions so that I can plan my travel better.

#### Acceptance Criteria

1. WHEN a user opens the app THEN the system SHALL display total number of passes to be used the next day
2. WHEN displaying predictions THEN the system SHALL show expected passes per time session
3. WHEN showing session data THEN the system SHALL highlight the top 3 busiest sessions
4. WHEN predictions are displayed THEN the system SHALL update data in real-time based on survey responses

### Requirement 5

**User Story:** As a pass holder, I want to receive a QR code that can be added to my mobile wallet so that I can easily access my pass when needed.

#### Acceptance Criteria

1. WHEN a user completes the survey process THEN the system SHALL generate a unique QR code for the pass
2. WHEN the QR code is generated THEN the system SHALL create a .pkpass file for iOS wallet integration
3. WHEN the pass is created THEN the system SHALL ensure the QR code contains encrypted pass validation data
4. WHEN the pass is added to wallet THEN the system SHALL maintain real-time sync with pass status

### Requirement 6

**User Story:** As MTR staff or HKU security, I want to scan QR codes to validate passes so that I can efficiently process queue skip requests.

#### Acceptance Criteria

1. WHEN staff scans a QR code THEN the system SHALL validate the pass authenticity and status
2. WHEN a valid pass is scanned THEN the system SHALL mark the pass as redeemed
3. WHEN a pass is redeemed THEN the system SHALL prevent further use of the same pass
4. WHEN an invalid or expired pass is scanned THEN the system SHALL display an error message to staff
5. WHEN processing passes THEN the system SHALL treat Standard and Fast passes identically in the scanning process

### Requirement 7

**User Story:** As a pass holder, I want to transfer my unused passes to friends so that passes don't go to waste.

#### Acceptance Criteria

1. WHEN a user wants to transfer a pass THEN the system SHALL allow transfer by entering recipient's UID
2. WHEN a transfer is initiated THEN the system SHALL verify the recipient exists in the system
3. WHEN transfer is confirmed THEN the system SHALL update pass ownership on-chain
4. WHEN transfer is complete THEN the system SHALL notify both sender and recipient

### Requirement 8

**User Story:** As a user in need of passes, I want to request pass donations from the community so that I can access passes when I've used mine.

#### Acceptance Criteria

1. WHEN a user needs passes THEN the system SHALL allow posting donation requests in a community forum
2. WHEN posting a request THEN the system SHALL require the user to state their reason
3. WHEN other users view requests THEN the system SHALL allow upvoting to prioritize requests
4. WHEN a donation is made THEN the system SHALL automatically close the request post
5. WHEN requests are displayed THEN the system SHALL show highest upvoted requests at the top

### Requirement 9

**User Story:** As a venue administrator, I want to control which user groups can access my queue system so that I can balance stakeholder interests and manage capacity effectively.

#### Acceptance Criteria

1. WHEN configuring user access THEN the system SHALL allow administrators to define user groups (e.g., employees, residents, students, general public, tourists)
2. WHEN setting group policies THEN the system SHALL allow different pass allocations, restrictions, and privileges per group
3. WHEN public access is enabled THEN the system SHALL allow administrators to require identity verification methods
4. WHEN balancing stakeholder interests THEN the system SHALL allow administrators to prioritize certain groups while maintaining fairness
5. WHEN extending to new venues THEN the system SHALL allow completely different user group configurations per venue

### Requirement 10

**User Story:** As a system administrator, I want to manage pass usage limits so that I can prevent system abuse and manage capacity.

#### Acceptance Criteria

1. WHEN system usage is high THEN the system SHALL implement daily pass usage limits
2. WHEN limits are set THEN the system SHALL ensure limits are not overly restrictive
3. WHEN semester ends THEN the system SHALL monitor for bulk pass usage attempts
4. WHEN capacity constraints exist THEN the system SHALL allow restricting pass usage to rush hours only

### Requirement 11

**User Story:** As a platform operator, I want all pass transactions to be recorded on-chain so that the system maintains transparency and prevents fraud.

#### Acceptance Criteria

1. WHEN passes are allocated THEN the system SHALL record allocation transactions on blockchain
2. WHEN passes are transferred THEN the system SHALL record transfer transactions on blockchain
3. WHEN passes are redeemed THEN the system SHALL record redemption transactions on blockchain
4. WHEN blockchain transactions occur THEN the system SHALL use a low-fee, high-speed blockchain network
5. WHEN on-chain data is recorded THEN the system SHALL ensure data privacy while maintaining transparency

### Requirement 12

**User Story:** As a venue administrator, I want to enable or disable specific features for my location so that I can customize the system to match my operational needs and local regulations.

#### Acceptance Criteria

1. WHEN configuring a venue THEN the system SHALL provide feature toggles for pass transfer functionality
2. WHEN setting up community features THEN the system SHALL allow enabling/disabling donation requests and community forums
3. WHEN managing pass lifecycle THEN the system SHALL allow administrators to configure whether passes expire and expiration policies
4. WHEN controlling access methods THEN the system SHALL allow administrators to enable/disable government ID requirements
5. WHEN setting up pass types THEN the system SHALL allow administrators to configure one-time pass availability and distribution rules
6. WHEN deploying across regions THEN the system SHALL support different regulatory compliance requirements per jurisdiction

### Requirement 13

**User Story:** As a building administrator, I want to configure the system for my commercial building so that I can manage elevator queues and visitor access.

#### Acceptance Criteria

1. WHEN extending to commercial buildings THEN the system SHALL allow building-specific configuration
2. WHEN configuring buildings THEN the system SHALL support integration with existing gate systems
3. WHEN issuing visitor passes THEN the system SHALL allow one-time pass generation by building administrators
4. WHEN managing building access THEN the system SHALL maintain visitor privacy without requiring ID registration
5. WHEN scheduling meetings THEN the system SHALL allow administrators to pre-issue passes to guests